import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { cropClassification } from '../../models/parcel-finder.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParcelFinderService {
  
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  findParcel(request: FormData): Observable<string> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/find-parcel`, request)
      .pipe(map(res => res.response));
  }

  getCropClassifications(): Observable<cropClassification[]> {
    return this.http.get<cropClassification[]>('crop_classification.json');
  }
}
