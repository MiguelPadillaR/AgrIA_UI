import { Component, ElementRef, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { IChatMessage } from '../../../models/chat-assistant.model';
import { ChatAssistantService } from '../../../services/chat-assistant.service/chat-assistant.service';
import { MarkdownModule } from 'ngx-markdown';
@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [MarkdownModule,],
  templateUrl: './chat-assistant.component.html',
  styleUrl: './chat-assistant.component.css',
})

export class ChatAssistantComponent {
  // Chat History stack
  public chatHistory: IChatMessage[] = [
    { role: 'model', 
      content: '¡Hola!\n\nSoy tu Asistente de Imágenes Agrícolas, ¡pero puedes llamarme **AgrIA**!\n\nMi propósito aquí es **analizar imágenes satelitales de campos de cultivo** para asistir a los agricultores en en análisis del su **uso del espacio y los recursos, así como las prácticas agrícolas**, con el fin de **asesorarles a reunir los requisitos para las subvenciones del Comité Europeo de Política Agrícola Común (CAP)**.\n\n¡Sólo tienes que subir una imagen satelital de tus campos de cultivo y nos pondremos manos a la obra!\n\nSi tiene alguna pregunta, también puede escribir en el cuadro de texto',
    },
  ];
  // Index of the first message after chat sanitizaion
  firstIndex: number = 5;
  // HTML element to automatically scroll to the bototm
  @ViewChild('scrollableContainer') scrollableContainer!: ElementRef;
  public chatAssistantService: ChatAssistantService = inject(ChatAssistantService);

  ngOnInit() {
    this.animateLoadingResponse(this.chatHistory[0], this.chatHistory[0].content);
    // Load chat history if it is empty or has only the initial message
    if (this.chatHistory.length <= 1) {
      this.chatAssistantService.loadActiveChatHistory().subscribe({
        next: (response: IChatMessage[]) => {
          this.chatHistory = this.sanitizeChatHistory(response);
          this.scrollToBottom();  // scroll to bottom after loading history
        },
        error: (err) => {
          console.error('Error loading chat history:', err);
          this.chatHistory.push({
            role: 'model',
            content: 'No se pudo cargar el historial de chat. Inténtelo de nuevo más tarde o comience un nuevo chat con esta conversación.'
          });
          this.scrollToBottom();
        }
      });
    }
  }

  ngAfterViewInit() {
    if(this.chatHistory.length > 1) {
      this.scrollToBottom();  // in case there are preloaded messages
    }
  }

  /**
   * Sanitizes chat history by removing initial messages and replacing image description requests
   * @param response - Chat history response from the server
   * @returns Sanitized chat history
   */
  private sanitizeChatHistory(response: IChatMessage[]) {
    console.log("OG History:", response)
    // Skip context setting messages
    let index = this.firstIndex;
    while (index < response.length && response[index].role !== 'model') {
      index++;
    };
    let sanitized_history = response.slice(index);

    // Remove image descriptions requests data
    for(let msg of sanitized_history){
      if (msg.content.includes('###DESCRIBE')) {
        msg.content = '*Petición de descripción de imagen...*'
      }
    }

    return sanitized_history
  }


  /**
   * Scrolls to the bottom of the chat window
   */
  public scrollToBottom() {
    setTimeout(() => {
      const el = this.scrollableContainer?.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 1500);
  }

  /**
   * Adds user message to chat and gets assistant output
   * @param content - User message content 
   */
  public addUserMessage(content: string) {
    if (content.length > 0) {
      this.chatHistory.push({ role: 'user', content });
      this.getAssistantOutput(content);
      this.scrollToBottom()
    }
    this.scrollToBottom();
  }

  /**
   * Send image to assistant
   * @param imageFile - Image file to be sent to the assistant
   */
  public sendImage(imageFile: File, isDetailedDescription: boolean) {
    this.showMessageIcon();
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('isDetailedDescription', String(isDetailedDescription));
    
    this.chatAssistantService.sendImage(formData).subscribe({
      next: (responseText: string) => {
        this.hideMessageIcon();
        this.displayResponse(responseText);
      },
      error: (err) => {
        console.error('Error from assistant:', err);
        this.hideMessageIcon();
        this.chatHistory.push({
          role: 'model',
          content: 'Oops! Something went wrong while processing your image. Error was:\n\n' + err.error.error + '\n\nPlease try again later.'
        });
        this.scrollToBottom();
      }
    });  
  }

  /**
   * Send input and pushes assistant's response to chat stack
   *  
   * @param userInput - User input message
   */
  public getAssistantOutput(userInput: string) {
    const trimmedInput: string = userInput.trim().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
    this.showMessageIcon();
    const formData = new FormData();
    formData.append('userInput', trimmedInput);

    this.chatAssistantService.sendUserInput(formData).subscribe({
      next: (responseText: string) => {
        this.hideMessageIcon();
        this.displayResponse(responseText);
      },
      error: (err) => {
        console.error('Error from assistant:', err);
        this.hideMessageIcon();
        this.chatHistory.push({
          role: 'model',
          content: 'Oops! Something went wrong while processing your image. Error was:\n\n' + err.error.error + '\n\nPlease try again later.'
        });
        this.scrollToBottom();
      }
    });
  }

  /**
   * Shows message icon while waiting response
   */
  public showMessageIcon() {
    const loadingMsg: IChatMessage = { role: 'model', content: '', loading: true };
    this.chatHistory.push(loadingMsg); // Add loading indicator
    this.scrollToBottom();
  }

  /**
   * Hides message icon after response
   */
  public hideMessageIcon() {
    const last = this.chatHistory[this.chatHistory.length - 1];
    if (last.loading) {
      this.chatHistory.pop();
    }
  }  

  public displayResponse(responseText: string) {
    const newMsg: IChatMessage = {
      role: 'model',
      content: responseText,
      revealProgress: ''
    };
    this.chatHistory.push(newMsg);
    this.animateLoadingResponse(newMsg, responseText);
    this.scrollToBottom();

    console.log(responseText)

  }
      
  /**
   * Animates assitant's output message display
   * 
   * @param msg 
   * @param fullText 
   */
  public animateLoadingResponse(msg: IChatMessage, fullText: string) {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        msg.revealProgress = fullText.slice(0, index + 1);
        index++;
      } else {
        clearInterval(interval);
        msg.revealProgress = undefined; // done animating
      }
    }, 5); // Adjust typing speed (ms per character)
  }
}
  
