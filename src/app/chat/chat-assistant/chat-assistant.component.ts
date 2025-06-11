import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ChatMessage } from '../../models/chat-assistant.model';
import { ChatAssistantService } from '../../services/chat-assistant.service/chat-assistant.service';
import { MarkdownModule } from 'ngx-markdown';
@Component({
  selector: 'app-chat-assistant',
  imports: [
    MarkdownModule,
  ],
  templateUrl: './chat-assistant.component.html',
  styleUrl: './chat-assistant.component.css'
})

export class ChatAssistantComponent {
  // Chat History stack
  public chatHistory: ChatMessage[] = [
    { role: 'assistant', content: 'Hello there!\n\nI am your Agricultural Imaging Assitant, but you can call me AgrIA!\n\nMy purpose here is to analyse satellite images of crop fields to help farmers analyze their use of space and resources, as well as agricultural practices, in order to help them qualify for the European Comitee of Common Agricultural Policies (CAPs) subventions.\n\nJust upload a satellite image of your crop fields and we will get to work!\n\nIf you have any questions, you can also type in the textbox.'},
  ];
  // HTML element to automatically scroll to the bototm
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private chatAssistantService: ChatAssistantService = inject(ChatAssistantService);

  // TODO: Load chat history from local storage or API or other source
  ngAfterViewInit() {
    this.scrollToBottom();  // in case there are preloaded messages
  }

  /**
   * * Scrolls to the bottom of the chat window
   */
  private scrollToBottom() {
    setTimeout(() => {
      this.scrollAnchor?.nativeElement.scrollIntoView({ block:"end", behavior: 'smooth' });
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
    }
    this.scrollToBottom();
  }

  /**
   * Send image to assistant
   * @param imageFile - Image file to be sent to the assistant
   */
  sendImage(imageFile: File) {
    this.showMessageIcon();
    const formData = new FormData();
    formData.append('image', imageFile);
    
    this.chatAssistantService.sendImage(formData).subscribe({
      next: (responseText: string) => {
        this.hideMessageIcon();
        this.displayResponse(responseText);
      },
      error: (err) => {
        console.error('Error from assistant:', err);
        this.hideMessageIcon();
        this.chatHistory.push({
          role: 'assistant',
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
    formData.append('user_input', trimmedInput);

    this.chatAssistantService.sendUserInput(formData).subscribe({
      next: (responseText: string) => {
        this.hideMessageIcon();
        this.displayResponse(responseText);
      },
      error: (err) => {
        console.error('Error from assistant:', err);
        this.hideMessageIcon();
        this.chatHistory.push({
          role: 'assistant',
          content: 'Oops! Something went wrong while processing your image. Error was:\n\n' + err.error.error + '\n\nPlease try again later.'
        });
        this.scrollToBottom();
      }
    });
  }

  /**
   * Shows message icon while waiting response
   */
  private showMessageIcon() {
    const loadingMsg: ChatMessage = { role: 'assistant', content: '', loading: true };
    this.chatHistory.push(loadingMsg); // Add loading indicator
    this.scrollToBottom();
  }

  /**
   * Hides message icon after response
   */
  private hideMessageIcon() {
    const last = this.chatHistory[this.chatHistory.length - 1];
    if (last.loading) {
      this.chatHistory.pop();
    }
  }  

  private displayResponse(responseText: string) {
    const newMsg: ChatMessage = {
      role: 'assistant',
      content: responseText,
      revealProgress: ''
    };
    this.chatHistory.push(newMsg);
    this.animateLoadingResponse(newMsg, responseText);
    this.scrollToBottom();

  }
      
  /**
   * Animates assitant's output message display
   * @param msg 
   * @param fullText 
   */
  private animateLoadingResponse(msg: ChatMessage, fullText: string) {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        msg.revealProgress = fullText.slice(0, index + 1);
        index++;
      } else {
        clearInterval(interval);
        msg.revealProgress = undefined; // done animating
      }
    }, 20); // Adjust typing speed (ms per character)
  }
}
  
