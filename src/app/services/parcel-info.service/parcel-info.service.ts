import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IFindParcelresponse } from '../../models/parcel-finder-response.models';

@Injectable({
  providedIn: 'root'
})
export class ParcelInfoService {
  
  private parcelInfoSubject = new BehaviorSubject<IFindParcelresponse | null>(null);
  parcelInfo$ = this.parcelInfoSubject.asObservable();

  setParcelInfo(data: IFindParcelresponse | null) {
    this.parcelInfoSubject.next(data);
  }
}
