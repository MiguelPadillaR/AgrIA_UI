import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatAssistantService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public sendUserInput(request: FormData): Observable<string> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/send-user-input`, request)
      .pipe(map(res => res.response));
  }

  public sendImage(request: FormData): Observable<string> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/send-image`, request)
    .pipe(map(res => res.response));
  }
}