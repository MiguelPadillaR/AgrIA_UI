import { Component, EventEmitter, inject, Output, signal, WritableSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IFindParcelresponse } from '../../../models/parcel-finder.model';
import { NotificationService } from '../../../services/notification.service/notification.service';
import { ISigpacLocationData } from '../../../models/parcel-locator.model';
import { ParcelFinderService } from '../../../services/parcel-finder.service/parcel-finder.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-parcel-locator',
  imports: [
    TranslateModule,
    FormsModule,
    NgSelectModule,
],
  templateUrl: './parcel-locator.component.html',
  styleUrl: './parcel-locator.component.css'
})
export class ParcelLocatorComponent {
  @Output() parcelFound = new EventEmitter<IFindParcelresponse>();
  @Output() loadingStarted = new EventEmitter<number>();
  @Output() findParcelRequest = new EventEmitter<FormData>();

  protected province: string = '';
  protected municipality: string = '';
  protected polygon: number | null = null;
  protected parcelId: number | null = null;

  protected sigpacLocationData: ISigpacLocationData[] = [];
  provinces: string[] = [];
  municipalities: string[] = [];

  protected today: string = new Date().toISOString().split('T')[0];
  protected selectedDate: string  = this.today;
  protected isVaildInput: WritableSignal<boolean> = signal(true);

  protected isLoading: WritableSignal<boolean> = signal(false);
  protected maxLoadingDuration: number = 60;

  private parcelFinderService: ParcelFinderService = inject(ParcelFinderService);
  private notificationService: NotificationService = inject(NotificationService);
  
  ngOnInit() {
    this.loadSigpacLocationData();
  }

  /**
   * Loads SIGPAC province and municipalities data.
   */
  private loadSigpacLocationData() {
    this.parcelFinderService.loadSigpacLocationData().subscribe(
      (sigpacLocationData: ISigpacLocationData[]) => {
        this.sigpacLocationData = sigpacLocationData;
        this.provinces = this.sigpacLocationData.map(data => data.province);

      },
      (error) => {
        this.notificationService.showNotification("parcel-finder.sigpac-table.error", `\n${error.error.error}`, "error", 10000);
        console.error('Error loading crop classifications:', error);
      }
    );
  }
  
  protected onProvinceChange(selected: string) {
    this.municipalities = this.getMunicipalities(selected);
    this.municipality = ''; // reset previous selection
  }

  private getMunicipalities(province: string): string[] {
    const entry = this.sigpacLocationData.find(data => data.province === province);
    return entry ? entry.municipalities : [];
  }

  private isValidInput() {
    this.isVaildInput.set(true);

    if (this.province.length < 1) {
      const message = "Province not specified.";
      this.isVaildInput.set(false);
      this.notificationService.showNotification(
        "parcel-locator.missing.province", "", "error", 10000
      );
      throw new Error(message);
    } 
    else if (this.municipality.length < 1) {
      this.isVaildInput.set(false);
      const message = "Municipality not specified.";
      this.notificationService.showNotification(
        "parcel-locator.missing.municipality", "", "error", 10000
      );
      throw new Error(message);
    }
        else if (!this.polygon) {
      this.isVaildInput.set(false);
      const message = "Polygon not specified.";
      this.notificationService.showNotification(
        "parcel-locator.missing.polygon", "", "error", 10000
      );
      throw new Error(message);
    } 
    else if (!this.parcelId) {
      this.isVaildInput.set(false);
      const message = "Parcel not specified.";
      this.notificationService.showNotification(
        "parcel-locator.missing.parcel-id", "", "error", 10000
      );
      throw new Error(message);
    } 
  }

  protected findParcel() {
    // Validate input before sending request
    this.isValidInput();
    // Init loading notifications
    this.notificationService.showNotification("parcel-finder.searching", "", "info")
    this.isLoading.set(true);
    this.loadingStarted.emit(this.maxLoadingDuration);
    document.body.style.cursor = 'progress';
    // Create find parcel request
    const formData = new FormData();
    formData.append('province', this.province);
    formData.append('municipality', this.municipality);
    formData.append('polygon', String(this.polygon));
    formData.append('parcelId', String(this.parcelId));
    formData.append('selectedDate', this.selectedDate);
    // Output request to parcel finder component
    this.findParcelRequest.emit(formData)
  }

  protected clearForm() {
    this.province = '';
    this.municipality = '';
    this.polygon = null;
    this.parcelId = null;
    this.selectedDate = this.today;
  }
}
