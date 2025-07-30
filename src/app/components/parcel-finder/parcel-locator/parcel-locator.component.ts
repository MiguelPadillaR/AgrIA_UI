import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { IFindParcelresponse } from '../../../models/parcel-finder.models';

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

  @Output() parcelFound = new EventEmitter<IFindParcelresponse>();
  @Output() loadingStarted = new EventEmitter<number>();
  @Output() findParcelRequest = new EventEmitter<FormData>();


}
