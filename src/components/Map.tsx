'use client';

import * as React from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { ServiceRequest } from '@/types/boston-311';
import { MapMarker } from './MapMarker';

interface MapProps {
  requests: ServiceRequest[];
  selectedRequest?: ServiceRequest | null;
  onMarkerClick?: (request: ServiceRequest) => void;
}

export interface MapComponentRef {
  focusOnLocation: (lat: number, lng: number) => void;
}

const getMarkerColor = (requestType: string, isSelected: boolean = false) => {
  if (isSelected) {
    return '#dc2626'; // red-600 for selected
  }
  if (requestType.toLowerCase().includes('parking')) {
    return '#f59e0b'; // amber-500
  }
  if (requestType.toLowerCase().includes('enforcement')) {
    return '#ef4444'; // red-500
  }
  return '#84cc16'; // lime-500
};

const getMarkerSize = (isSelected: boolean = false) => {
  return isSelected ? 24 : 16;
};

export const MapComponent = forwardRef<MapComponentRef, MapProps>(
  function MapComponent({ requests, selectedRequest, onMarkerClick }, ref) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
      longitude: -71.0589,
      latitude: 42.3601,
      zoom: 12,
    });
    const [hoveredRequest, setHoveredRequest] = useState<ServiceRequest | null>(null);

    useImperativeHandle(ref, () => ({
      focusOnLocation: (lat: number, lng: number) => {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: 16,
            duration: 1000,
          });
        }
      },
    }));

    return (
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        {requests.map((request) => {
          const isSelected = selectedRequest?.case_enquiry_id === request.case_enquiry_id;
          return (
            <Marker
              key={request.case_enquiry_id}
              longitude={parseFloat(request.longitude)}
              latitude={parseFloat(request.latitude)}
            >
              <div
                onClick={() => onMarkerClick?.(request)}
                onMouseEnter={() => setHoveredRequest(request)}
                onMouseLeave={() => setHoveredRequest(null)}
                className="cursor-pointer relative"
              >
                <MapMarker 
                  color={getMarkerColor(request.type, isSelected)} 
                  size={getMarkerSize(isSelected)}
                  isSelected={isSelected}
                />
                {(isSelected || hoveredRequest?.case_enquiry_id === request.case_enquiry_id) && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10 shadow-lg">
                    {request.case_title}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                  </div>
                )}
              </div>
            </Marker>
          );
        })}
      </Map>
    );
  }
);
