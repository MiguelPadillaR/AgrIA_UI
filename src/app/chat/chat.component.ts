import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatAssistantComponent } from "./chat-assistant/chat-assistant.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, ChatAssistantComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  // Image file
  public imageFile: File | null = null;
  // Image URL/path for the preview module
  public imagePreviewUrl: string | null = null;
  // User's chat input
  public userInput: string = ""
  @ViewChild(ChatAssistantComponent) chatAssistant!: ChatAssistantComponent;

  // Router for navigation
  private router: Router = inject(Router);

  /**
   * Reads file and displays image on image proview module.
   * 
   * @param event 
   */
  public onFileSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.imageFile = files[0] as File;
      this.chatAssistant.sendImage(this.imageFile);

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
  }

  /**
   * Mock method to provide user input suggestion based on last LLM answer (TODO).
   * 
   */
  public getInputSuggesiton() {
    this.userInput = "This is my brand new suggestion!"
  }

    /* Reroute to chat while sending parcel image file */
  public goToParcelFinderView(): void {
    this.router.navigate(['/parcel-finder']);
  }

}