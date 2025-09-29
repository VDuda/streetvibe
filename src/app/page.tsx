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

  const handleRequestClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleFocusMap = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.focusOnLocation(lat, lng);
    }
    handleCloseModal();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading 311 data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">Error fetching data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-[400px] p-8 overflow-y-auto border-r">
        <Sidebar 
          requests={requests || []} 
          onRequestClick={handleRequestClick}
          selectedRequest={selectedRequest}
        />
      </aside>
      <main className="flex-1">
        <MapComponent 
          ref={mapRef}
          requests={requests || []} 
          selectedRequest={selectedRequest}
          onMarkerClick={handleRequestClick}
        />
      </main>
      
      <ServiceRequestModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFocusMap={handleFocusMap}
      />
    </div>
  );
}


