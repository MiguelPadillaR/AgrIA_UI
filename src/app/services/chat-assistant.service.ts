import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatAssistantService {

  private apiUrl = 'http://127.0.0.1:5000'

  constructor(private http: HttpClient) {}

  sendUserInput(request: FormData): Observable<string> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/send-user-input`, request)
      .pipe(map(res => res.response));
  }
  sendImage(request: FormData): Observable<string> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/send-image`, request)
    .pipe(map(res => res.response));
  }

}

