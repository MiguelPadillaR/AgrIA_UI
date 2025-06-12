import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ICropClassification } from '../../models/parcel-finder.models';
import { environment } from '../../../environments/environment';
import { IFindParcelresponse } from '../../models/parcel-finder-response.models';

@Injectable({
  providedIn: 'root'
})
export class ParcelFinderService {
  
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  findParcel(request: FormData): Observable<IFindParcelresponse> {
    return this.http.post<{ response: IFindParcelresponse }>(`${this.apiUrl}/find-parcel`, request)
      .pipe(map(res => res.response));
  }

  getCropClassifications(): Observable<ICropClassification[]> {
    return this.http.get<ICropClassification[]>('crop_classification.json');
  }
}
