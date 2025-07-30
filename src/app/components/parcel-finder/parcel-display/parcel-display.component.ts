import { Component, inject, input, Input, signal, WritableSignal } from '@angular/core';
import { ParcelFinderService } from '../../../services/parcel-finder.service/parcel-finder.service';
import { IFindParcelresponse } from '../../../models/parcel-finder.models';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, } from '@ngx-translate/core';
import { ProgressBarComponent } from '../../progress-bar/progress-bar.component';

@Component({
  selector: 'app-parcel-display',
  imports: [
    FormsModule,
    TranslateModule,
    ProgressBarComponent,
],
  templateUrl: './parcel-display.component.html',
  styleUrl: './parcel-display.component.css'
})
export class ParcelDisplayComponent {
  // URL of the parcel's satellite image
  @Input() public parcelImageUrl: string | null = null;
  // Loading image flag
  @Input() public isLoading: WritableSignal<boolean> = signal(false)
  // Planned duration of the loading
  @Input() public progressMaxDuration: number = 40;
  // Selected parcel information
  @Input() public selectedParcelInfo: IFindParcelresponse | null = null;
  // User preference for longer image description
  public isDetailedDescription: boolean = false;
  
  // Service to communicate parcel info from parcel finder to chat
  private parcelFinderService = inject(ParcelFinderService);
  // Router for navigation
  private router: Router = inject(Router);

  constructor() {}

  /* Reroute to chat while sending parcel image file */
  public confirmParcel(): void {
    if (this.selectedParcelInfo) {
      this.selectedParcelInfo.isDetailedDescription = this.isDetailedDescription;
      this.selectedParcelInfo.hasBeenDescribed = false;
      this.parcelFinderService.setParcelInfo(this.selectedParcelInfo);
      this.router.navigate(['/chat']);
    }
  }

}
