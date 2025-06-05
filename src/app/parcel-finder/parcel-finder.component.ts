import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parcel-finder',
  imports: [],
  templateUrl: './parcel-finder.component.html',
  styleUrl: './parcel-finder.component.css'
})
export class ParcelFinderComponent {

  private cadastralReference: string = '';
  private selectedDate: string  = new Date().toISOString().split('T')[0];
  public imagePreviewUrl: string | null = null;

  constructor(private router: Router) {}

  findParcel() {
    const formData = new FormData();
    formData.append('cadastralReference', this.cadastralReference);
    formData.append('selectedDate', this.selectedDate);

    throw new Error('Method not implemented.');
  }

  /* Reroute to chat while sending parcel image file */
  goToChat(): void {
    // this.sendParcelToChat();
    this.router.navigate(['/chat']);
  }

  /* Send parcel image to chat and begin conversation */
  sendParcelToChat() {
    throw new Error('Method not implemented.');
  }

}
