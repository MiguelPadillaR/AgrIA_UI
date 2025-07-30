import { ChangeDetectorRef, Component, inject, input, Input, signal, WritableSignal } from '@angular/core';
import { ParcelFinderService } from '../../../services/parcel-finder.service/parcel-finder.service';
import { IFindParcelresponse } from '../../../models/parcel-finder.models';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, } from '@ngx-translate/core';
import { ProgressBarComponent } from '../../progress-bar/progress-bar.component';
import { Subscription } from 'rxjs';

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
  @Input() public parcelImageUrl: string | null | undefined = null;
  // Loading image flag
  @Input() public isLoading: WritableSignal<boolean> = signal(false)
  // Planned duration of the loading
  @Input() public progressMaxDuration: number = 40;
  // Selected parcel information
  private selectedParcelInfo: IFindParcelresponse | null = null;
  // User preference for longer image description
  public isDetailedDescription: boolean = false;
  
  // Service to communicate parcel info from parcel finder to chat
  private parcelFinderService = inject(ParcelFinderService);
  // Router for navigation
  private router: Router = inject(Router);
  // Subscriptions service
  private subscription = new Subscription();
  // Change detection service
  private cdRef: ChangeDetectorRef = inject(ChangeDetectorRef)

  constructor() {}

    ngOnInit(): void {
    this.subscription = this.parcelFinderService.parcelInfo$
      .subscribe(parcelInfo => {
        this.selectedParcelInfo = parcelInfo;
        this.parcelImageUrl = parcelInfo?.imagePath
        this.cdRef.markForCheck(); // Needed if OnPush, safe otherwise too
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  /* Reroute to chat while sending parcel image file */
  public confirmParcel(): void {
    if (this.selectedParcelInfo) {
      this.selectedParcelInfo.isDetailedDescription = this.isDetailedDescription;
      this.selectedParcelInfo.hasBeenDescribed = false;
      this.router.navigate(['/chat']);
    }
  }

}
