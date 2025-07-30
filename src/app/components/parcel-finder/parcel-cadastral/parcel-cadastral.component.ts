import { Component, EventEmitter, inject, Output, signal, WritableSignal } from '@angular/core';
import { IFindParcelresponse } from '../../../models/parcel-finder.models';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../services/notification.service/notification.service';
import { ParcelFinderService } from '../../../services/parcel-finder.service/parcel-finder.service';

@Component({
  selector: 'app-parcel-cadastral',
  imports: [
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './parcel-cadastral.component.html',
  styleUrl: './parcel-cadastral.component.css'
})
export class ParcelCadastralComponent {

  @Output() parcelFound = new EventEmitter<IFindParcelresponse>();
  @Output() loadingStarted = new EventEmitter<number>();
  @Output() findParcelRequest = new EventEmitter<FormData>();

  // Cadastral reference of the parcel
  public cadastralReference: string = '14048A001001990000RM';  // TODO: REMOVE WHEN TESTING IS DONE
  // Date for which the parcel image is requested
  public selectedDate: string  = new Date().toISOString().split('T')[0];
  // Max date allowed for the date picker
  public today: string = new Date().toISOString().split('T')[0];
  // Loading variable for styling
  public isLoading: WritableSignal<boolean> = signal(false)
  // Maximum seconds set for the progress bar
  public maxLoadingDuration: number = 40;
  // Selected parcel information
  protected selectedParcelInfo: IFindParcelresponse | null = null;
  // URL of the parcel's satellite image
  public parcelImageUrl: string | null = null;

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
    // Init loading notifications
    this.notificationService.showNotification("parcel-finder.searching", "", "info")
    this.isLoading.set(true);
    this.loadingStarted.emit(this.maxLoadingDuration);
    document.body.style.cursor = 'progress';
    // Reset parcel image
    this.parcelImageUrl = null;
    // Create find parcel request
    const formData = new FormData();
    formData.append('cadastralReference', this.cadastralReference);
    formData.append('selectedDate', this.selectedDate);
    formData.append('isFromCadastralReference', "True");
    // Output request to parcel finder component
    this.findParcelRequest.emit(formData)
  }

  public clearForm() {
    this.cadastralReference = '';
    this.selectedDate = new Date().toISOString().split('T')[0];
  }

}
