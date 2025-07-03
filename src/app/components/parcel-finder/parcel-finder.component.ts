import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ParcelFinderService } from '../../services/parcel-finder.service/parcel-finder.service';
import { IFindParcelresponse } from '../../models/parcel-finder-response.models';

@Component({
  selector: 'app-parcel-finder',
  imports: [
    FormsModule,
    TranslateModule,
],
  templateUrl: './parcel-finder.component.html',
  styleUrl: './parcel-finder.component.css'
})
export class ParcelFinderComponent {
  // Cadastral reference of the parcel
  public cadastralReference: string = '37040A004000110000BJ';  // TODO: REMOVE WHEN TESTING IS DONE
  // Date for which the parcel image is requested
  public selectedDate: string  = new Date().toISOString().split('T')[0];
  // Max date allowed for the date picker
  public today: string = new Date().toISOString().split('T')[0];
  // Loading variable for styling
  public isLoading: WritableSignal<boolean> = signal(false)
  // User preference for longer image description
  public isDetailedDescription: boolean = false;
  // Selected parcel information
  private selectedParcelInfo: IFindParcelresponse | null = null;
  // URL of the parcel's satellite image
  public parcelImageUrl: string | null = null;

  // Service to handle parcel finding operations
  private parcelFinderService = inject(ParcelFinderService);
  // Router for navigation
  private router: Router = inject(Router);
    // Utility to get object keys
  public objectKeys = Object.keys;


  constructor() {}

  ngOnInit(): void {
    // Empty the observable by emitting null
    this.parcelFinderService.setParcelInfo(null);
  }
 
 /**
 * Finds a parcel based on the provided cadastral reference and selected date.
 * 
 */
public findParcel() {
  this.isLoading.set(true);
  document.body.style.cursor = 'progress';
  this.parcelImageUrl = null;

  const formData = new FormData();
  formData.append('cadastralReference', this.cadastralReference);
  formData.append('selectedDate', this.selectedDate);

  this.parcelFinderService.findParcel(formData).subscribe({
    next: (response: IFindParcelresponse) => {
      this.selectedParcelInfo = response;
      this.parcelImageUrl = this.selectedParcelInfo.imagePath;
      document.body.style.cursor = 'default';
    },
    error: (err) => {
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

  public clearForm() {
    this.cadastralReference = '';
    this.selectedDate = new Date().toISOString().split('T')[0];
  }

  /* Reroute to chat while sending parcel image file */
  public confirmParcel(): void {
    if (this.selectedParcelInfo) {
      this.selectedParcelInfo.isDetailedDescription = this.isDetailedDescription;
      this.parcelFinderService.setParcelInfo(this.selectedParcelInfo);
      this.router.navigate(['/chat']);
    }
  }
}
