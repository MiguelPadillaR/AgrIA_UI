import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapShapeService {

  private httpClient: HttpClient = inject(HttpClient);

  constructor() { }

  getStateShapes() {
    return this.httpClient.get('gz_2010_us_040_00_5m.json');
  }
}
