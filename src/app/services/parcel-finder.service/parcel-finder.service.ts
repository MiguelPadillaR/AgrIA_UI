import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ICropClassification } from '../../models/parcel-drawer.model';
import { environment } from '../../../environments/environment';
import { IFindParcelresponse } from '../../models/parcel-finder.model';
import { ISigpacLocationData } from '../../models/parcel-locator.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelFinderService {
  
  private apiUrl = environment.apiUrl;
  private parcelInfoSubject = new BehaviorSubject<IFindParcelresponse | null>(null);
  parcelInfo$ = this.parcelInfoSubject.asObservable();

  constructor(private http: HttpClient) {}

  findParcel(request: FormData): Observable<IFindParcelresponse> {
    return this.http.post<{ response: IFindParcelresponse }>(`${this.apiUrl}/find-parcel`, request)
      .pipe(map(res => res.response));
  }

   loadSigpacLocationData(): Observable<ISigpacLocationData[]> {
    return this.http.get<ISigpacLocationData[]>('data/sigpac_location_data.json');
  }

  loadCropClassifications(): Observable<ICropClassification[]> {
    return this.http.get<ICropClassification[]>('data/crop_classification_en.json');
  }

  setParcelInfo(data: IFindParcelresponse) {
    this.parcelInfoSubject.next(data);
  }
  
}
