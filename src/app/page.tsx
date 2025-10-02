'use client';

import { useState, useRef } from 'react';
import { MapComponent } from '@/components/Map';
import { Sidebar } from '@/components/Sidebar';
import { ServiceRequestModal } from '@/components/ServiceRequestModal';
import { use311Data } from '@/hooks/use-311-data';
import { ServiceRequest } from '@/types/boston-311';

export default function Home() {
  const { data: requests, isLoading, error } = use311Data();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mapRef = useRef<{ focusOnLocation: (lat: number, lng: number) => void } | null>(null);

  // Handle clicking on an incident in the list - focus map immediately
  const handleIncidentClick = (request: ServiceRequest) => {
    const lat = parseFloat(request.latitude);
    const lng = parseFloat(request.longitude);
    
    if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
      mapRef.current.focusOnLocation(lat, lng);
    }
    
    setSelectedRequest(request);
  };

  // Handle clicking the details button - open modal
  const handleDetailsClick = (request: ServiceRequest, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the incident click handler
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // Handle map marker clicks
  const handleMarkerClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFocusMap = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.focusOnLocation(lat, lng);
    }
    handleCloseModal();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading Boston 311 data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-xl mb-4">Error loading data</div>
          <div className="text-gray-600 mb-4">{error.message}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Single Layout - List and Map Side by Side */}
      <div className="h-screen flex bg-white">
        {/* Sidebar */}
        <aside className="w-96 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h1 className="text-xl font-bold text-gray-900">Boston 311</h1>
            <p className="text-sm text-gray-600">{requests?.length || 0} recent incidents</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar 
              requests={requests || []} 
              onIncidentClick={handleIncidentClick}
              onDetailsClick={handleDetailsClick}
              selectedRequest={selectedRequest}
            />
          </div>
        </aside>
        
        {/* Map */}
        <main className="flex-1">
          <MapComponent 
            ref={mapRef}
            requests={requests || []} 
            selectedRequest={selectedRequest}
            onMarkerClick={handleMarkerClick}
          />
        </main>
      </div>

      {/* Modal for detailed view */}
      <ServiceRequestModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFocusMap={handleFocusMap}
      />
    </>
  );
}