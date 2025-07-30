import * as L from 'leaflet';
import 'leaflet-draw';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ParcelFinderService } from '../../../services/parcel-finder.service/parcel-finder.service';
import { FormsModule } from '@angular/forms';
import { ICropClassification, IGroupedCropClassification, IParcelDrawerGeojson, ISelectedCrop } from '../../../models/parcel-drawer.models';
import { ProgressBarComponent } from "../../progress-bar/progress-bar.component";
import { NotificationService } from '../../../services/notification.service/notification.service';
import { IFindParcelresponse, IParcelMetadata } from '../../../models/parcel-finder.models';
import { Router } from '@angular/router';

// Set default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "public/leaflet/marker-icon-2x.png",
  iconUrl: 'public/leaflet/marker-icon.png',
  shadowUrl: 'public/leaflet/marker-shadow.png',
});

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
  private map!: L.DrawMap;
  // Coordinates marker
  private activeMarker: L.Marker | null = null;
  // Map zoom level attribute
  private mapZoom: number = 5;
  // Feature group to hold drawn items
  private drawnItems = new L.FeatureGroup();
  // Flag for when a shape is being drawn
  private isDrawing: WritableSignal<boolean> = signal(false);
  // Coordinates attribute
  public mapCenter: string = '40.400409, -3.631434';
  // Coordinates attribute
  public coordinates: string = this.mapCenter; // TODO: REMOVE Center coordinates (40.4165, -3.70256)
  // Date for which the parcel image is requested
  public selectedDate: string  = new Date().toISOString().split('T')[0];
  // Max date allowed for the date picker
  public today: string = new Date().toISOString().split('T')[0];
  // Parcel's geometry attribute
  public parcelGeometry: IParcelDrawerGeojson | null = null;
  // Active Tab flag
  public activeTab: 'sigpac' | 'address' = 'sigpac';
  // List of SIGPAC's crop classifications
  public cropClassification: ICropClassification[] = [];
  // Grouped crop classifications by type and subtype
  public groupedCropClassification: IGroupedCropClassification = {};
  // Selected crop classifications
  public selectedClassifications: ISelectedCrop[] = [];
  // Parcel Metadata
  private parcelMetadata: IParcelMetadata = {
    query: [],
    arboles: [],
    convergencia: {
      cat_fechaultimaconv: ''
    },
    id: [],
    isRecin: false,
    parcelaInfo: {
      agregado: 0,
      dn_surface: 0,
      municipio: '',
      parcela: 0,
      poligono: 0,
      provincia: '',
      referencia_cat: ''
    },
    usos: [],
    vigencia: '',
    vuelo: {
      fecha_vuelo: 0
    }
  };
  // Selected parcel response information
  protected selectedParcelInfo: IFindParcelresponse | null = null;
  // Detailed description flag
  public isDetailedDescription: boolean = false;
  // Loading process flag
  public isLoading: WritableSignal<boolean> = signal(false);

  // Service to handle parcel finding operations
  private parcelFinderService: ParcelFinderService = inject(ParcelFinderService);
  // Service for notifications
  private notificationService: NotificationService = inject(NotificationService);
  // Translation service
  private translateService: TranslateService = inject(TranslateService);
  // Utility to get object keys
  public objectKeys = Object.keys;
  // Router for navigation
  private router: Router = inject(Router);
  

  constructor() { }
  
  ngOnInit() {
    this.loadCropClassifications();
  }

  /**
   * Initializes the map and loads the provider layer.
   */
  ngAfterViewInit(): void {
    this.initMap();
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
    
    this.mapEventHandling();
  }

  /**
   * Handler for relevant map events.
   * 
   */
  private mapEventHandling() {
    this.setupDrawEvents();
    this.setupClickHandler();
  }

  /**
   * Drawing, editing and deleting layers' event handlers.
   * 
   */
  private setupDrawEvents() {
    // Start of drawing/editing/deleting → enable drawing state
    this.map.on(L.Draw.Event.DRAWSTART, () => this.isDrawing.set(true));
    this.map.on(L.Draw.Event.EDITSTART, () => this.isDrawing.set(true));
    this.map.on(L.Draw.Event.DELETESTART, () => this.isDrawing.set(true));

    // End of drawing/editing/deleting → disable drawing state
    this.map.on(L.Draw.Event.DRAWSTOP, () => this.isDrawing.set(false));
    this.map.on(L.Draw.Event.EDITSTOP, () => this.isDrawing.set(false));
    this.map.on(L.Draw.Event.DELETESTOP, () => this.isDrawing.set(false));

    // When a new shape is created
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      this.drawnItems.clearLayers();
      const layer = event.layer;
      this.drawnItems.addLayer(layer);

      // Convert  to GeoJSON and store it in parcelGeometry
      this.parcelGeometry = layer.toGeoJSON().geometry as IParcelDrawerGeojson;
      this.parcelGeometry.CRS = 'epsg:4326';
    });

    // When features are deleted
    this.map.on(L.Draw.Event.DELETED, () => {
      this.parcelGeometry = null;
    });
  }

  /**
   * Coordinates markers' related click event handler.
   */
  private setupClickHandler() {
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.isDrawing()) {
        return;
      }

      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      const coords = `${lat}, ${lng}`;
      console.log('Clicked coordinates:', coords);

        // Copy coordinates to clipboard
        navigator.clipboard.writeText(coords)
        .then(() => {
          if (this.map) {
            this.resetCoordinatesMarker(parseFloat(lat), parseFloat(lng));
            this.coordinates = coords;
            this.notificationService.showNotification(
              'parcel-drawer.coordinates.new-coordinates',
              coords,
              'info'
            );
          }
        })
        .catch(err => {
          console.error('Failed to copy coordinates:', err);
          this.notificationService.showNotification(
            'parcel-drawer.coordinates.new-coordinates',
            err,
            'error'
          );
        });
    });
  }

  /**
   * Reset coordinate marker plarcing and info.
   * 
   * @param lat - latitude component.
   * @param lng - Longitude component.
   */
  private resetCoordinatesMarker(lat: number, lng: number) {
    if (this.activeMarker) {
      this.map.removeLayer(this.activeMarker);
    }
    const coords = `${lat}, ${lng}`;

    // Create new marker
    this.activeMarker = L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup(`Coord: ${coords}`)
      .openPopup();
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

    this.resetCoordinatesMarker(coords[0], coords[1])
    this.scrollToMap();
  }

  /**
   * Scrolls view to map element.
   */
  private scrollToMap(): void {
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }


  /**
   * Resets the map view to the default coordinates and zoom level, clearing any drawn shapes.
   */
  public resetMapAndCoordinates(): void {
    this.parcelGeometry = null;
    this.drawnItems.clearLayers();
    this.mapZoom = 5;
    if (this.activeMarker) {
      this.map.removeLayer(this.activeMarker);
    }

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
        surface: null,
        irrigation: null
      });
    } else {
      this.selectedClassifications.splice(index, 1);
    }
  }

  /**
   * Checks if a crop classification item is selected.∫
   * 
   * @param item - The crop classification item to check.
   * @returns 
   */
  public isSelected(item: ICropClassification): boolean {
  return this.selectedClassifications.some(
    (entry) => entry.classification === item
  );
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

  /**
   * Sends the parcel geometry and metadata to the backend for processing.
   *  
   */
  public sendParcelDrawerInfo(): void {
    try {
      // Validate request inputs
      this.validateInput();
      this.isLoading.set(true);
      document.body.style.cursor = 'progress';
      this.notificationService.showNotification("parcel-finder.searching", "", "info")

      // Add essential metadata from crop classification to request
      this.parcelMetadata.query = [];  // Reset metadata info
      for (const classification of this.selectedClassifications) {
        const item = classification.classification
          this.parcelMetadata.query.push({
            dn_surface: Number(classification.surface) * 10000,
            uso_sigpac: `${item.class}-${item.name}`,
            superficie_admisible: Number(classification.surface) * 10000,
            recinto: 0,
            coef_regadio: classification.irrigation ?? 0,
            admisibilidad: 0,
            altitud: 0,
            incidencias: '',
            inctexto: '',
            pendiente_media: 0,
            region: ''
          });
      };

      // Build and send request form
      const formData = new FormData();
      formData.append('parcelGeometry', this.parcelGeometry ? JSON.stringify(this.parcelGeometry) : 'None');
      formData.append('parcelMetadata', this.parcelMetadata ? JSON.stringify(this.parcelMetadata) : 'None');
      console.log("this.parcelMetadata", this.parcelMetadata)
      formData.append('coordinates', this.coordinates ? this.coordinates : 'None');
      formData.append('selectedDate', this.selectedDate);
      formData.append('isFromCadastralReference', "False");

      this.parcelFinderService.findParcel(formData).subscribe({
        next: (response: IFindParcelresponse) => {
          this.notificationService.showNotification("parcel-finder.success","","success")
          this.selectedParcelInfo = response;
          document.body.style.cursor = 'default';
          console.log("Parcel finder response:", response)
        },
        error: (err) => {
          this.isLoading.set(false);
          const errorMessage = err?.error?.error?.includes("No images are available")? 
            this.translateService.currentLang === "es"? "No hay imágenes disponibles para la fecha seleccionada, las imágenes se procesan al final de cada mes."
            : "No images are available for the selected date, images are processed at the end of each month."
            : err.error.error
          this.notificationService.showNotification("parcel-finder.error",`\n${errorMessage}`,"error", 10000)
          console.error('Parcel fetch failed', err);
          document.body.style.cursor = 'default';
        },
        complete: () => {
          this.isLoading.set(false);
          document.body.style.cursor = 'default';
        }
      });
    } catch (err) {
      // Optional: additional logging or handling
      this.notificationService.showNotification("parcel-finder.error",`\n${err}`,"error", 10000)
      console.error("Validation Error:", err);
    }
  }

  /**
   * Validate the parcel geometry and selected classifications
   */
  private validateInput() {
    if (!this.parcelGeometry && !this.activeMarker) { // TODO: REMOVE WHEN IMPLEMENTED
      const message = "No parcel drawing / marker found.";
      this.notificationService.showNotification(
        "parcel-drawer.missing.parcel-drawing", "", "error", 10000
      );
      throw new Error(message);
    }
    else if (this.parcelGeometry) {
      if (!this.selectedClassifications || this.selectedClassifications.length === 0) {
        const message = "No crop classification selected for parcel geometry.";
        this.notificationService.showNotification(
          "parcel-drawer.missing.crop-classification", "", "error", 10000
        );
        throw new Error(message);
      }
      if (this.selectedClassifications.some(item => item.surface === null)) {
        const message = "Some selected crop classifications have missing surface values.";
        this.notificationService.showNotification(
          "parcel-drawer.missing.surface", "", "error", 10000
        );
        throw new Error(message);
      }
    }
  }

  public resetForm(): void {
    // TODO: Work in progress...
    this.selectedClassifications = [];
  }
  
}
