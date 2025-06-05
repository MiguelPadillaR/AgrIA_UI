import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParcelFinderService {
  
  private apiUrl = 'http://127.0.0.1:5000'

  constructor(private http: HttpClient) {}

  findParcel(request: FormData): Observable<string> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/find-parcel`, request)
      .pipe(map(res => res.response));
  }

  getCropClassifiation(): Observable<string> {
    const request = {}
    return this.http.post<{ response: string }>(`${this.apiUrl}/get-crop-classification`, request)
      .pipe(map(res => res.response));
  }
}
