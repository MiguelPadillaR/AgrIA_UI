import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { cropClassification, GroupedCropClassification } from '../models/parcel-finder.models';
import { ParcelFinderService } from '../services/parcel-finder.service';
@Component({
  selector: 'app-parcel-finder',
  imports: [FormsModule],
  templateUrl: './parcel-finder.component.html',
  styleUrl: './parcel-finder.component.css'
})
export class ParcelFinderComponent {
  // Cadastral reference of the parcel
  public cadastralReference: string = '';
  // Date for which the parcel image is requested
  public selectedDate: string  = new Date().toISOString().split('T')[0];
  // List of SIGPAC's crop classifications
  public cropClassification: cropClassification[] = [];
  // Grouped crop classifications by type and subtype
  public groupedCropClassification: GroupedCropClassification = {};
  // Selected crop classifications
  private selectedClassifications: cropClassification[] = [];
  // URL of the parcel's satellite image
  public parcelImageUrl: string | null = null;

  // Service to handle parcel finding operations
  private parcelFinderService = inject(ParcelFinderService);
  // Router for navigation
  private router: Router = inject(Router);
    // Utility to get object keys
  public objectKeys = Object.keys;


  constructor() {}

  ngOnInit() {
    this.loadCropClassifications();
  }
 
  private loadCropClassifications() {
    this.parcelFinderService.getCropClassifications().subscribe(
      (cropClassification: cropClassification[]) => {
        this.cropClassification = cropClassification;
        this.groupedCropClassification = this.groupByTypeAndSubtype(cropClassification);

      },
      (error) => {
        console.error('Error loading crop classifications:', error);
      }
    );
  }

  /**
   * Toggles the selection state of a crop classification item.
   * If the item is already selected, it will be removed from the selection.
   * If the item is not selected, it will be added to the selection.
   * 
   * @param clickedItem - The crop classification item to toggle.
   */
  public toggleSelectedClassification(clickedItem: cropClassification): void {
    !this.selectedClassifications.includes(clickedItem) ? 
      this.selectedClassifications.push(clickedItem): 
      this.selectedClassifications = this.selectedClassifications.filter(item => item !== clickedItem);
  }
  /**
   * Groups crop classifications by type and subtype.
   * 
   * @param data - Array of crop classifications to be grouped.
   * @returns An object where keys are types and values are objects with subtypes as keys.
   */
  private groupByTypeAndSubtype(data: cropClassification[]) {
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

 /**
 * Finds a parcel based on the provided cadastral reference and selected date.
 * 
 * @throws Error Always throws "Method not implemented." as this method is a stub.
 */
  public findParcel() {
    const formData = new FormData();
    formData.append('cadastralReference', this.cadastralReference);
    formData.append('selectedDate', this.selectedDate);
    this.parcelFinderService.findParcel(formData).subscribe(
      (response: any) => {
        console.log(response)
      }
    )
  }

  public clearForm() {
    this.cadastralReference = '';
    this.selectedDate = new Date().toISOString().split('T')[0];
  }

  /* Reroute to chat while sending parcel image file */
  public goToChatView(): void {
    // TODO this.sendParcelToChat();
    this.router.navigate(['/chat']);
  }

  /* Send parcel image to chat and begin conversation */
  public sendParcelToChat() {
    throw new Error('Method not implemented.');
  }

}
