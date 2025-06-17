import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { ICropClassification, IGroupedCropClassification } from '../models/parcel-finder.models';
import { ParcelFinderService } from '../services/parcel-finder.service/parcel-finder.service';
import { IFindParcelresponse } from '../models/parcel-finder-response.models';
import { ParcelInfoService } from '../services/parcel-info.service/parcel-info.service';
@Component({
  selector: 'app-parcel-finder',
  imports: [FormsModule],
  templateUrl: './parcel-finder.component.html',
  styleUrl: './parcel-finder.component.css'
})
export class ParcelFinderComponent {
  // Cadastral reference of the parcel
  public cadastralReference: string = '37040A004000110000BJ';  // TODO: REMOVE WHEN TESTING IS DONE
  // Date for which the parcel image is requested
  public selectedDate: string  = new Date().toISOString().split('T')[0];
  // Loading variable for styling
  public isLoading: WritableSignal<boolean> = signal(false)
  // User preference for longer image description
  public isDetailedDescription: boolean = false;
/* 
  // List of SIGPAC's crop classifications
  public cropClassification: ICropClassification[] = [];
  // Grouped crop classifications by type and subtype
  public groupedCropClassification: IGroupedCropClassification = {};
  // Selected crop classifications
  private selectedClassifications: ICropClassification[] = [];
 */
  // Selected parcel information
  private selectedParcelInfo: IFindParcelresponse | null = null;
  // URL of the parcel's satellite image
  public parcelImageUrl: string | null = null;

  // Service to handle parcel finding operations
  private parcelFinderService = inject(ParcelFinderService);
  // Service to communicate parcel info from parcel finder to chat
  private parcelInfoService = inject(ParcelInfoService);
  // Router for navigation
  private router: Router = inject(Router);
    // Utility to get object keys
  public objectKeys = Object.keys;


  constructor() {}

  ngOnInit(): void {
    // Empty the observable by emitting null
    this.parcelInfoService.setParcelInfo(null);
  }

 /* 
  private loadCropClassifications() {
    this.parcelFinderService.getCropClassifications().subscribe(
      (cropClassification: ICropClassification[]) => {
        this.cropClassification = cropClassification;
        this.groupedCropClassification = this.groupByTypeAndSubtype(cropClassification);

      },
      (error) => {
        console.error('Error loading crop classifications:', error);
      }
    );
  }

  public toggleSelectedClassification(clickedItem: ICropClassification): void {
    !this.selectedClassifications.includes(clickedItem) ? 
      this.selectedClassifications.push(clickedItem): 
      this.selectedClassifications = this.selectedClassifications.filter(item => item !== clickedItem);
  } 
  
    private groupByTypeAndSubtype(data: ICropClassification[]) {
    const grouped: any = {};

    for (const item of data) {
      const type = item.type || 'Unknown';
      const subtype = item.subtype1 || item.subtype2 || 'Otro';

      if (!grouped[type]) grouped[type] = {};
      if (!grouped[type][subtype]) grouped[type][subtype] = [];

      grouped[type][subtype].push(item);
    }

    return grouped;
  }
  */
 
 /**
 * Finds a parcel based on the provided cadastral reference and selected date.
 * 
 */
public findParcel() {
  this.isLoading.set(true);
  document.body.style.cursor = 'progress';

  const formData = new FormData();
  formData.append('cadastralReference', this.cadastralReference);
  formData.append('selectedDate', this.selectedDate);

  this.parcelFinderService.findParcel(formData).subscribe({
    next: (response: IFindParcelresponse) => {
      this.selectedParcelInfo = response;
      this.parcelImageUrl = this.selectedParcelInfo.imagePath;
    },
    error: (err) => {
      console.error('Parcel fetch failed', err);
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
      this.parcelInfoService.setParcelInfo(this.selectedParcelInfo);
      this.router.navigate(['/chat']);
    }
  }
}
