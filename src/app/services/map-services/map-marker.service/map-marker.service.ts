import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import * as L from 'leaflet';
import { MapPopupService } from '../map-popup.service/map-popup.service';

@Injectable({
  providedIn: 'root'
})
export class MapMarkerService {

  private capitals: string = 'capitals.geojson';
  private static scaledRadius(val: number, maxVal: number): number {
    return 20 * (val / maxVal);
  }
  private mapPopupService: MapPopupService = inject(MapPopupService);

  constructor(private http: HttpClient) { }

    makeCapitalMarkers(map: L.Map): void {
    this.http.get(this.capitals).subscribe((res: any) => {
      for (const c of res.features) {
        const lon = c.geometry.coordinates[0];
        const lat = c.geometry.coordinates[1];
        const marker = L.marker([lat, lon]);
        marker.addTo(map);

        console.log(`Marker added at ${lat}, ${lon}`);
      }
    });
  }

      makeCapitalCircleMarkers(map: L.Map): void {
    this.http.get(this.capitals).subscribe((res: any) => {
      for (const c of res.features) {
        const lon = c.geometry.coordinates[0];
        const lat = c.geometry.coordinates[1];
        const maxPop = Math.max(...res.features.map((x: { properties: { population: any; }; }) => x.properties.population), 0);

        const circle = L.circleMarker([lat, lon], {radius: MapMarkerService.scaledRadius(c.properties.population, maxPop)});
        circle.bindPopup(this.mapPopupService.makeCapitalPopup(c.properties));

        circle.addTo(map);
        console.log(`Circle Marker added at ${lat}, ${lon}`);
      }
    });
  }


}
