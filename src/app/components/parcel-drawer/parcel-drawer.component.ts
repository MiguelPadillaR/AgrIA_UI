import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as L from 'leaflet';
import { MapMarkerService } from '../../services/map-services/map-marker.service/map-marker.service';
import { MapShapeService } from '../../services/map-services/map-shape.service/map-shape.service';

const iconRetinaUrl = 'public/leaflet/marker-icon-2x.png';
const iconUrl = 'public/leaflet/marker-icon.png';
const shadowUrl = 'public/leaflet/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-parcel-drawer',
  imports: [
    TranslateModule,
  ],
  templateUrl: './parcel-drawer.component.html',
  styleUrl: './parcel-drawer.component.css'
})
export class ParcelDrawerComponent {
  // Translation service
  private translateService = inject(TranslateService);
  
  private map: any;
  private states: any;
  private mapMarkerService: MapMarkerService = inject(MapMarkerService)
  private mapShapeService: MapShapeService = inject(MapShapeService)

  constructor() { }
  ngAfterViewInit(): void {
    this.initMap();
    this.mapShapeService.getStateShapes().subscribe(states => {
      this.states = states;
      this.initStatesLayer(states);
    });
    this.mapMarkerService.makeCapitalCircleMarkers(this.map);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [40.463667, -3.74922],
      zoom: 6
    });

    const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
      minZoom: 3,
      attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    });

    tiles.addTo(this.map);
  }

  private initStatesLayer(states: any): void {
    const stateLayer = L.geoJSON(states, {
      style: (feature) => ({
        weight: 3,
        opacity: 0.5,
        color: '#008f68',
        fillOpacity: 0.8,
        fillColor: '#6DB65B'
      }),
      onEachFeature: (feature, layer) => (
        layer.on({
          mouseover: (e) => (this.highlightFeature(e)),
          mouseout: (e) => (this.resetFeature(e)),
        })
      )
    });

    this.map.addLayer(stateLayer);
    stateLayer.bringToBack();
  }

  private highlightFeature(e: { target: any; }) {
    const layer = e.target;

    layer.setStyle({
      weight: 10,
      opacity: 1.0,
      color: '#DFA612',
      fillOpacity: 1.0,
      fillColor: '#FAE042'
    });
  }

  private resetFeature(e: { target: any; }) {
    const layer = e.target;

    layer.setStyle({
      weight: 3,
      opacity: 0.5,
      color: '#008f68',
      fillOpacity: 0.8,
      fillColor: '#6DB65B'
    });
  }

  public centerMap(): void {
  // TODO
  }
    
}
