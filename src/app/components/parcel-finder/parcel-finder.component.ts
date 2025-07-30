import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IFindParcelresponse } from '../../models/parcel-finder.models';
import { ParcelFinderService } from '../../services/parcel-finder.service/parcel-finder.service';
import { NotificationService } from '../../services/notification.service/notification.service';
import { ParcelDrawerComponent } from "./parcel-drawer/parcel-drawer.component";
import { ParcelDisplayComponent } from "./parcel-display/parcel-display.component";
import { ParcelLocatorComponent } from './parcel-locator/parcel-locator.component';

@Component({
  selector: 'app-parcel-finder',
  imports: [
    FormsModule,
    TranslateModule,
    ParcelDrawerComponent,
    ParcelDisplayComponent,
    ParcelLocatorComponent,
],
  templateUrl: './parcel-finder.component.html',
  styleUrl: './parcel-finder.component.css'
})
export class ParcelFinderComponent {
  // Cadastral reference of the parcel
  public cadastralReference: string = '14048A001001990000RM';  // TODO: REMOVE WHEN TESTING IS DONE
  // Date for which the parcel image is requested
  public selectedDate: string  = new Date().toISOString().split('T')[0];
  // Max date allowed for the date picker
  public today: string = new Date().toISOString().split('T')[0];
  // Loading variable for styling
  public isLoading: WritableSignal<boolean> = signal(false)
  // Maximum seconds set for the progress bar
  public progressMaxDuration: number = 40;
  // Selected parcel information
  protected selectedParcelInfo: IFindParcelresponse | null = null;
  // URL of the parcel's satellite image
  public parcelImageUrl: string | null = null;
  // Active tab attribute
  public activeTab: 'finder' | 'drawer' | 'locator' = 'finder';

  // Service to handle parcel finding operations
  private parcelFinderService = inject(ParcelFinderService);
  // Translation service
  private translateService = inject(TranslateService);
  // Service for notifications
  private notificationService = inject(NotificationService)

  constructor() {}

 /**
 * Finds a parcel based on the provided cadastral reference and selected date.
 * 
 */
public findParcel() {
  this.notificationService.showNotification("parcel-finder.searching", "", "info")
  this.isLoading.set(true);
  document.body.style.cursor = 'progress';
  this.parcelImageUrl = null;

  const formData = new FormData();
  formData.append('cadastralReference', this.cadastralReference);
  formData.append('selectedDate', this.selectedDate);
  formData.append('isFromCadastralReference', "True");

  this.parcelFinderService.findParcel(formData).subscribe({
    next: (response: IFindParcelresponse) => {
      this.notificationService.showNotification("parcel-finder.success","","success")
      this.selectedParcelInfo = response;
      this.parcelImageUrl = this.selectedParcelInfo.imagePath;
      document.body.style.cursor = 'default';
      console.log("Parcel finder response:", response)
    },
    error: (err) => {
      const errorMessage = err.error.error.includes("No images are available")? 
        this.translateService.currentLang === "es"? "No hay imágenes disponibles para la fecha seleccionada, las imágenes se procesan al final de cada mes."
          : "No images are available for the selected date, images are processed at the end of each month."
        : err.error.error
      this.notificationService.showNotification("parcel-finder.error",`\n${errorMessage}`,"error", 10000)
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

}
