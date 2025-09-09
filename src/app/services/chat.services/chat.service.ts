import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IChatParcelResponse } from '../../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public loadParcelDataToChat(request:FormData): Observable<IChatParcelResponse> {
    return this.http.post<{ response: IChatParcelResponse }>(`${this.apiUrl}/load-parcel-data-to-chat`, request)
    .pipe(map(res => res.response));
  }

  public getInputSuggestion(): Observable<string> {
    return this.http.get<{ response: string }>(`${this.apiUrl}/get-input-suggestion`)
    .pipe(map(res => res.response));
  }
}
