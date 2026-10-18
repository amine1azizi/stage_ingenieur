import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss'
})
export class LocationPickerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Output() locationChange = new EventEmitter<{ latitude: number; longitude: number } | null>();
  @ViewChild('mapContainer', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marker?: L.Marker;
  private resizeTimeout?: ReturnType<typeof setTimeout>;

  get hasLocation(): boolean {
    return this.validCoordinates(this.latitude, this.longitude);
  }

  ngAfterViewInit(): void {
    const hasLocation = this.hasLocation;
    const center: L.LatLngExpression = hasLocation
      ? [this.latitude as number, this.longitude as number]
      : [34.0, 9.5];

    this.map = L.map(this.mapContainer.nativeElement).setView(center, hasLocation ? 13 : 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.setLocation(event.latlng.lat, event.latlng.lng, true);
    });
    this.updateMarker();
    this.resizeTimeout = setTimeout(() => this.map?.invalidateSize(), 200);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['latitude'] || changes['longitude']) && this.map) {
      this.updateMarker();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.map?.remove();
    this.map = undefined;
  }

  clearLocation(): void {
    this.marker?.remove();
    this.marker = undefined;
    this.locationChange.emit(null);
  }

  private updateMarker(): void {
    if (!this.map) {
      return;
    }
    if (!this.hasLocation) {
      this.marker?.remove();
      this.marker = undefined;
      if (this.latitude == null && this.longitude == null) {
        this.map.setView([34.0, 9.5], 6);
      }
      return;
    }

    const position: L.LatLngExpression = [this.latitude as number, this.longitude as number];
    this.map.setView(position, 13);
    if (this.marker) {
      this.marker.setLatLng(position);
      return;
    }

    this.marker = this.createMarker(position, this.map);
  }

  private setLocation(latitude: number, longitude: number, emit: boolean): void {
    const roundedLatitude = this.roundCoordinate(latitude);
    const roundedLongitude = this.roundCoordinate(longitude);
    this.latitude = roundedLatitude;
    this.longitude = roundedLongitude;

    if (this.map) {
      const position: L.LatLngExpression = [roundedLatitude, roundedLongitude];
      if (this.marker) {
        this.marker.setLatLng(position);
      } else {
        this.marker = this.createMarker(position, this.map);
      }
    }

    if (emit) {
      this.locationChange.emit({
        latitude: roundedLatitude,
        longitude: roundedLongitude
      });
    }
  }

  private roundCoordinate(value: number): number {
    return Number(value.toFixed(6));
  }

  private createMarker(position: L.LatLngExpression, map: L.Map): L.Marker {
    const marker = L.marker(position, {
      draggable: true,
      icon: L.divIcon({
        className: '',
        html: '<span style="display:block;width:18px;height:18px;border:3px solid #fff;border-radius:50%;background:#0d6efd;box-shadow:0 1px 5px #333"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      })
    }).addTo(map);
    marker.on('dragend', () => {
      const markerPosition = marker.getLatLng();
      this.setLocation(markerPosition.lat, markerPosition.lng, true);
    });
    return marker;
  }

  private validCoordinates(latitude: number | null, longitude: number | null): boolean {
    return typeof latitude === 'number' &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      typeof longitude === 'number' &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180;
  }
}
