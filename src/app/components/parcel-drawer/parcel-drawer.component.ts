import { Component, inject } from '@angular/core';
import * as L from 'leaflet';
import { TranslateModule } from '@ngx-translate/core';
import { ParcelFinderService } from '../../services/parcel-finder.service/parcel-finder.service';
import { ICropClassification, IGroupedCropClassification, ISelectedCrop } from '../../models/parcel-finder.models';
import { MapMarkerService } from '../../services/map-services/map-marker.service/map-marker.service';
import { MapShapeService } from '../../services/map-services/map-shape.service/map-shape.service';
import { FormsModule } from '@angular/forms'; // <-- Add this import

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
    FormsModule,
  ],
  templateUrl: './parcel-drawer.component.html',
  styleUrl: './parcel-drawer.component.css'
})
export class ParcelDrawerComponent {
  // List of SIGPAC's crop classifications
  public cropClassification: ICropClassification[] = [];
  // Grouped crop classifications by type and subtype
  public groupedCropClassification: IGroupedCropClassification = {};
  // Selected crop classifications
public selectedClassifications: ISelectedCrop[] = [];
  
  // Service to handle parcel finding operations
  private parcelFinderService = inject(ParcelFinderService);
      // Utility to get object keys
  public objectKeys = Object.keys;

  private map: any;
  private mapMarkerService: MapMarkerService = inject(MapMarkerService)
  private mapShapeService: MapShapeService = inject(MapShapeService)

  constructor() { }
  
  ngOnInit() {
    this.loadCropClassifications();
  }

  /**
   * Initializes the map and loads the states layer.
   * This method is called after the view has been initialized.
   */
  ngAfterViewInit(): void {
    this.initMap();
    this.mapShapeService.getStateShapes().subscribe(states => {
      this.initStatesLayer(states);
    });
    this.mapMarkerService.makeCapitalCircleMarkers(this.map);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [40.4165, -3.70256],
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

  private loadCropClassifications() {
    this.parcelFinderService.getCropClassifications().subscribe(
      (cropClassification: ICropClassification[]) => {
        this.cropClassification = cropClassification;
        this.groupedCropClassification = this.groupByTypeAndSubtype(cropClassification);

      },
      (error) => {
        console.error('Error loading crop classifications:', error);
      }
    );
  }

  /**
   * Toggles the selection state of a crop classification item.
   * If the item is already selected, it will be removed from the selection.
   * If the item is not selected, it will be added to the selection.
   * 
   * @param clickedItem - The crop classification item to toggle.
   */
  public toggleSelectedClassification(clickedItem: ICropClassification): void {
    const index = this.selectedClassifications.findIndex(
      (entry) => entry.classification === clickedItem
    );

    if (index === -1) {
      this.selectedClassifications.push({
        classification: clickedItem,
        surface: null
      });
    } else {
      this.selectedClassifications.splice(index, 1);
    }
  }

  public trackClassification(item: ISelectedCrop): string {
  return item.classification.class;
}
  
  /**
   * Groups crop classifications by type and subtype.
   * 
   * @param data - Array of crop classifications to be grouped.
   * @returns An object where keys are types and values are objects with subtypes as keys.
   */
  private groupByTypeAndSubtype(data: ICropClassification[]) {
    const grouped: any = {};
      for (const item of data) {
        const type = item.type || 'Unknown';
        const subtype = item.subtype1 || item.subtype2 || 'Otro';
        if (!grouped[type]) grouped[type] = {};
        if (!grouped[type][subtype]) grouped[type][subtype] = [];
        grouped[type][subtype].push(item);
      }
      return grouped;
    }
}
