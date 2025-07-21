import { Component, inject } from '@angular/core';
import * as L from 'leaflet';
import { MapMarkerService } from '../../services/map-marker.service/map-marker.service';

@Component({
  selector: 'app-parcel-drawer',
  imports: [],
  templateUrl: './parcel-drawer.component.html',
  styleUrl: './parcel-drawer.component.css'
})
export class ParcelDrawerComponent {
  private map: any;
  private mapMarkerService: MapMarkerService = inject(MapMarkerService)
  constructor() { }
  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 36.71700017969052, -4.499799087394791 ],
      zoom: 17
    });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  

}
