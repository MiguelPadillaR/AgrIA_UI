import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatAssistantComponent } from "../chat-assistant/chat-assistant.component";

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, ChatAssistantComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] // fixed typo: styleUrl -> styleUrls
})
export class DashboardComponent {
  public imageFile: File | null = null;
  public imagePreviewUrl: string | null = null;
  public userInput: string = ""
  @ViewChild(ChatAssistantComponent) chatAssistant!: ChatAssistantComponent;

  public onFileSelected(event: any) {
    console.log("Event:", event); // Log the event object
    const files = event.target.files;
    console.log("Selected files:", files); // Log the selected files
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

  public sendUserInput() {
    if (this.userInput.trim()) {
      this.chatAssistant.addUserMessage(this.userInput);
      this.clearUserInput();
    }
  }

  public clearUserInput() {
    this.userInput = '';
  }

  public getInputSuggesiton() {
    this.userInput = "This is my brand new suggestion!"
  }
}
