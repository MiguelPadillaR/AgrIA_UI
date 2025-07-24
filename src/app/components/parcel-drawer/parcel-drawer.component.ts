import { Component, inject, signal, WritableSignal } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { TranslateModule } from '@ngx-translate/core';
import { ParcelFinderService } from '../../services/parcel-finder.service/parcel-finder.service';
import { ICropClassification, IGroupedCropClassification, ISelectedCrop } from '../../models/parcel-finder.models';
import { MapMarkerService } from '../../services/map-services/map-marker.service/map-marker.service';
import { MapShapeService } from '../../services/map-services/map-shape.service/map-shape.service';
import { FormsModule } from '@angular/forms'; // <-- Add this import
import { IParcelDrawerGeojson } from '../../models/parcel-drawer.models';
import { ProgressBarComponent } from "../progress-bar/progress-bar.component";
import { NotificationService } from '../../services/notification.service/notification.service';

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
    ProgressBarComponent,
],
  templateUrl: './parcel-drawer.component.html',
  styleUrl: './parcel-drawer.component.css'
})
export class ParcelDrawerComponent {
  // Leaflet map instance
  private map: L.DrawMap | null = null;
  // Feature group to hold drawn items
  private drawnItems = new L.FeatureGroup();
  // Coordinates attribute
  public mapCenter: string = '40.400409, -3.631434';
  // Coordinates attribute
  public coordinates: string = '40.400409, -3.631434'; // TODO: REMOVE Default Madrid coordinates (40.4165, -3.70256)
  // Parcel's geometry attribute
  public parcelDrawing: IParcelDrawerGeojson | null = null;
  // List of SIGPAC's crop classifications
  public cropClassification: ICropClassification[] = [];
  // Grouped crop classifications by type and subtype
  public groupedCropClassification: IGroupedCropClassification = {};
  // Selected crop classifications
  public selectedClassifications: ISelectedCrop[] = [];
  // Map zoom level attribute
  mapZoom: number = 6;
  // Loading process flag
  public isLoading: WritableSignal<boolean> = signal(false);

  // Service to handle parcel finding operations
  private parcelFinderService: ParcelFinderService = inject(ParcelFinderService);
  // Service for notifications
  private notificationService: NotificationService = inject(NotificationService);
  // Utility to get object keys
  public objectKeys = Object.keys;

  constructor() { }
  
  ngOnInit() {
    this.loadCropClassifications();
  }

  /**
   * Initializes the map and loads the provider layer.
   */
  ngAfterViewInit(): void {
    this.initMap();

    // this.mapShapeService.getStateShapes().subscribe(states => {
    //   this.initStatesLayer(states);
    // });
    // this.mapMarkerService.makeCapitalCircleMarkers(this.map);
  }
  
  /**
   * Initializes the map with a default center and zoom level, sets up the tile layer, and adds drawing controls.
   */
  private initMap(): void {
    // Initialize the map with a default center and zoom level
    this.map = L.map('map', {
      center: [Number(this.mapCenter.split(',')[0].trim()), Number(this.mapCenter.split(',')[1].trim())],
      zoom: this.mapZoom,
    });
    // Set the map view to the default coordinates
    const tiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 20,
        minZoom: 3,
        attribution:
          'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      }
    );
    tiles.addTo(this.map);

    // Use persistent FeatureGroup to hold drawn items
    this.map.addLayer(this.drawnItems);

    // Initialize the draw control and pass it the FeatureGroup of editable layers
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems,
      },
      draw: {
        polygon: {},
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
    });

    this.map.addControl(drawControl);

    // Event listener: what happens when a shape is created
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      this.drawnItems.clearLayers();

      const layer = event.layer;
      this.drawnItems.addLayer(layer);
      console.log('LAYER:', layer);
      
      this.parcelDrawing = layer.toGeoJSON().geometry as IParcelDrawerGeojson;
      console.log('Shape drawn:', this.parcelDrawing);
    });
  }

  /**
   * Centers the map on the provided coordinates and sets a closer zoom level.
   * 
   * @returns The current map instance.
   */
  public centerMapOnCoordinates(): void {
    this.mapZoom = this.mapZoom < 17? 17 : this.mapZoom; // Limit zoom level to a maximum of 16
    if (!this.map || !this.coordinates) return;

    const coords = this.coordinates
      .split(',')
      .map(coord => parseFloat(coord.trim()));

    if (coords.length === 2 && !coords.some(isNaN)) {
      const latlng = L.latLng(coords[0], coords[1]);
      this.map.setView(latlng, this.mapZoom);
    } else {
      this.notificationService.showNotification("parcel-drawer.coordinates.invalid", this.coordinates, "error", 10000);
      console.warn('Invalid coordinates format:', this.coordinates);
    }
  }

  /**
   * Resets the map view to the default coordinates and zoom level, clearing any drawn shapes.
   */
  public resetMapAndCoordinates(): void {
    this.parcelDrawing = null;
    this.drawnItems.clearLayers();
    this.mapZoom = 6;

    this.coordinates = this.mapCenter;
    const coords = this.coordinates.split(',').map(coord => parseFloat(coord.trim()));

    const latlng = L.latLng(coords[0], coords[1]);
    this.map?.setView(latlng, this.mapZoom);
    // this.coordinates = '';
  }

  /**
   * Loads crop classifications from the service and groups them by type and subtype.
   */
  private loadCropClassifications() {
    this.parcelFinderService.getCropClassifications().subscribe(
      (cropClassification: ICropClassification[]) => {
        this.cropClassification = cropClassification;
        this.groupedCropClassification = this.groupByTypeAndSubtype(cropClassification);

      },
      (error) => {
        this.notificationService.showNotification("parcel-finder.sigpac-table.error", `\n${error.error.error}`, "error", 10000);
        console.error('Error loading crop classifications:', error);
      }
    );
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

  /**
   * Toggles the selection state of a crop classification item and adds/removes it to/from selection.
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

  /**
   * Checks if a crop classification item is selected.
   * 
   * @param item - The selected crop classification item.
   * @returns The class (title) of the item if it is selected, otherwise an empty string.
   */
  public trackClassification(item: ISelectedCrop): string {
    return item.classification.class;
  }

  public sendParcelDrawerInfo(): void {
    if (!this.parcelDrawing) {
      this.notificationService.showNotification("parcel-drawer.missing.parcel-drawing", "", "error", 10000);
      console.log("No parcel drawing found.");
      return;
    } else if ( this.selectedClassifications?.length === 0) {
      this.notificationService.showNotification("parcel-drawer.missing.crop-classification", "", "error", 10000);
      console.log("No crop classification selected.");
      return;
    } else if (this.selectedClassifications?.some(item => item.surface === null)) {
        this.notificationService.showNotification("parcel-drawer.missing.surface", "", "error", 10000);
        console.log("Some selected crop classifications are missing surface values.");
      return;
    }
    this.notificationService.showNotification("parcel-drawer.info.TODO", "", "info");

    // TODO
    console.log("Selected classifications:", this.selectedClassifications);
    console.log("this.parcelDrawing:", this.parcelDrawing);
    this.isLoading.set(true);
  }

  public resetForm(): void {
    // TODO: Work in progress...
    this.selectedClassifications = [];
  }
  
}
