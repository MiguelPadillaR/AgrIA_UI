import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IChatParcelResponse } from '../../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public sendParcelInfoToChat(request:FormData): Observable<IChatParcelResponse> {
    return this.http.post<{ response: IChatParcelResponse }>(`${this.apiUrl}/send-parcel-info-to-chat`, request)
    .pipe(map(res => res.response));
  }

}
