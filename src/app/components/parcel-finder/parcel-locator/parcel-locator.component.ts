import { Component, inject, signal, WritableSignal } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ParcelFinderService } from '../../../services/parcel-finder.service/parcel-finder.service';
import { FormsModule } from '@angular/forms';
import { ICropClassification, IGroupedCropClassification, IParcelDrawerGeojson, ISelectedCrop } from '../../../models/parcel-drawer.models';
import { NotificationService } from '../../../services/notification.service/notification.service';
import { IFindParcelresponse, IParcelMetadata } from '../../../models/parcel-finder.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parcel-locator',
  imports: [
    TranslateModule,
    FormsModule,
],
  templateUrl: './parcel-locator.component.html',
  styleUrl: './parcel-locator.component.css'
})
export class ParcelLocatorComponent {

}
