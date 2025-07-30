import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ICropClassification } from '../../models/parcel-drawer.models';
import { environment } from '../../../environments/environment';
import { IFindParcelresponse } from '../../models/parcel-finder.models';

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

 getCropClassifications(): Observable<ICropClassification[]> {
    return this.http.get<ICropClassification[]>('data/crop_classification.json');
  }

  setParcelInfo(data: IFindParcelresponse) {
    this.parcelInfoSubject.next(data);
  }
  
}
