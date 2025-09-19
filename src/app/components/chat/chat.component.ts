import { Component, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChatAssistantComponent } from "./chat-assistant/chat-assistant.component";
import { Router } from '@angular/router';
import { ParcelFinderService } from '../../services/parcel-finder.service/parcel-finder.service';
import { ChatService } from '../../services/chat.services/chat.service';
import { IChatParcelResponse } from '../../models/chat.model';
import { take } from 'rxjs';
import { IFindParcelresponse } from '../../models/parcel-finder.model';
import { NotificationService } from '../../services/notification.service/notification.service';

@Component({
  selector: 'app-chat',
  imports: [
    FormsModule,
    ChatAssistantComponent,
    TranslateModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  // Image file
  public imageFile: File | null = null;
  // Image URL/path for the preview module
  public imagePreviewUrl: string | null = null;
  // Parcel's image information
  public parcelImageInfo: string =  "..."
  // User's chat input
  public userInput: string = ""
  // User preference for longer image description
  isDetailedDescription: boolean = false;
  // Loading variable for styling
  public isLoading: WritableSignal<boolean> = signal(false)

  @ViewChild(ChatAssistantComponent) chatAssistant!: ChatAssistantComponent;

  // Service to communicate parcel info from parcel finder to chat
  private parcelFinderService = inject(ParcelFinderService);
  // Service for notifications
  private notificationService = inject(NotificationService)
  // Chat service
  private chatService = inject(ChatService);
  // Router for navigation
  private router: Router = inject(Router);


  ngOnInit() {
    this.parcelFinderService.parcelInfo$.pipe(take(1))
    .subscribe(parcel => {
      if (parcel) {
      !parcel.hasBeenDescribed ? this.notificationService.showNotification("chat.load-parcel-finder-data-info", "", "info"): null;
        // Delay template updates to avoid ExpressionChanged errors
        setTimeout(() => {
          this.imagePreviewUrl = parcel.imagePath;
          this.parcelImageInfo = parcel.parcelInfo;
          !parcel.hasBeenDescribed ? this.sendParcelInfoToChat(parcel): null;
        }, 500);
      }
    });
  }

  /**
   * Takes detected parcel info and sends it to chat assistant for image description.
   * 
   * @param parcel 
   */
  private sendParcelInfoToChat(parcel: IFindParcelresponse) {
    this.chatAssistant.showMessageIcon() ;
    const [__, year, month] = this.imagePreviewUrl?.split('/')?.pop()?.split('.')[0].split("_") || [];
        
    const formData = new FormData();
    formData.append('imageDate', `${month}/${year}`);
    formData.append('imageCrops', JSON.stringify(parcel.metadata.query));
    formData.append('imageFilename', parcel.imagePath?.split('/')?.pop() ?? '');
    formData.append('isDetailedDescription', String(parcel.isDetailedDescription));

    this.chatService.loadParcelDataToChat(formData).pipe(take(1)).subscribe({
        next: (response: IChatParcelResponse) => { 
          this.notificationService.showNotification("chat.load-parcel-finder-data-success", "", "success");

          this.parcelImageInfo = response.imageDesc;
          parcel.parcelInfo = response.imageDesc;
          this.chatAssistant.hideMessageIcon();
          this.chatAssistant.displayResponse(response.text);
        }, 
        error: (err) => {
          this.notificationService.showNotification("chat.load-parcel-finder-data-error", err.error.error, "error", 10000);
          this.chatAssistant.hideMessageIcon();
        },
      });
    // Update the parcel info in the service
    parcel.hasBeenDescribed = true;
    this.parcelFinderService.setParcelInfo(parcel);
  }

  get displayImageName(): string | undefined {
    const fileName = this.imagePreviewUrl?.split('/').pop();
    return (fileName?.length ?? 0) < 2 ? this.imageFile?.name : fileName;
  }

  /**
   * Reads file and displays image on image preview module.
   * 
   * @param event 
   */
  public onFileSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.imageFile = files[0] as File;
      this.chatAssistant.sendImage(this.imageFile, this.isDetailedDescription);
      this.parcelImageInfo = "FECHA: *Sin datos*\nCULTIVO: *Sin datos*"

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(this.imageFile as Blob);
    } else {
      this.imageFile = null;
      this.imagePreviewUrl = null;
    }
  }

  /**
   * Collect and send user input to LLM's chat in backend.
   * 
   */
  public sendUserInput(): void {
    if (this.userInput.trim()) {
      this.chatAssistant.addUserMessage(this.userInput);
      this.clearUserInput();
    }
  }

  /**
   * Deletes user import from text area.
   * 
   */
  public clearUserInput() {
    this.userInput = '';
    this.chatAssistant.scrollToBottom(0);
  }

  /**
   * Provides user input suggestion based on last LLM answer.
   * 
   */
  public getInputSuggestion() {
    this.notificationService.showNotification("chat.suggestion-info", "", "info")
    this.isLoading.set(true);
    document.body.style.cursor = 'progress';
    this.chatService.getInputSuggestion().subscribe({
      next: (response: string) => {
      this.notificationService.showNotification("chat.suggestion-success", "", "success")
        this.userInput = response
        document.body.style.cursor = 'default';
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showNotification("chat.suggestion-error",`\n${err.error.error}`,"error", 10000)
        console.error('Parcel fetch failed', err);
        document.body.style.cursor = 'default';
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
        document.body.style.cursor = 'default';
      }
    });
  }

  /**
   * Reroute to parcel finder form view
   * 
   */
  public goToParcelFinderView(): void {
    this.router.navigate(['/parcel-finder']);
  }

}