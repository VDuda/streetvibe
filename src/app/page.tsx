'use client';

import { useState, useRef } from 'react';
import { MapComponent } from '@/components/Map';
import { Sidebar } from '@/components/Sidebar';
import { ServiceRequestModal } from '@/components/ServiceRequestModal';
import { use311Data } from '@/hooks/use-311-data';
import { ServiceRequest } from '@/types/boston-311';
import { List, Map as MapIcon, Info } from 'lucide-react';

export default function Home() {
  const { data: requests, isLoading, error } = use311Data();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'map'>('map');
  const mapRef = useRef<{ focusOnLocation: (lat: number, lng: number) => void } | null>(null);

  // Handle clicking on an incident in the list - focus map immediately
  const handleIncidentClick = (request: ServiceRequest) => {
    const lat = parseFloat(request.latitude);
    const lng = parseFloat(request.longitude);
    
    if (!isNaN(lat) && !isNaN(lng) && mapRef.current) {
      mapRef.current.focusOnLocation(lat, lng);
    }
    
    setSelectedRequest(request);
    setActiveView('map'); // Switch to map view on mobile
  };

  // Handle clicking the details button - open modal
  const handleDetailsClick = (request: ServiceRequest, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the incident click handler
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // Handle map marker clicks - focus and optionally show details
  const handleMarkerClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
    // Map will already be focused on this point since user clicked the marker
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFocusMap = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.focusOnLocation(lat, lng);
    }
    setActiveView('map');
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
      {/* Mobile View */}
      <div className="lg:hidden h-screen flex flex-col bg-white">
        {/* Mobile Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Boston 311</h1>
            <p className="text-sm text-gray-600">{requests?.length || 0} incidents</p>
          </div>
          
          {/* Mobile Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeView === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} className="inline mr-1" />
              List
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeView === 'map' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon size={16} className="inline mr-1" />
              Map
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 relative">
          {activeView === 'list' ? (
            <div className="h-full overflow-y-auto p-4">
              <Sidebar 
                requests={requests || []} 
                onIncidentClick={handleIncidentClick}
                onDetailsClick={handleDetailsClick}
                selectedRequest={selectedRequest}
              />
            </div>
          ) : (
            <MapComponent 
              ref={mapRef}
              requests={requests || []} 
              selectedRequest={selectedRequest}
              onMarkerClick={handleMarkerClick}
            />
          )}
        </div>
      </div>

      {/* Desktop View - List AND Map together */}
      <div className="hidden lg:flex h-screen bg-white">
        <aside className="w-96 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Boston 311</h1>
            <p className="text-gray-600 mt-1">{requests?.length || 0} recent incidents</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <Sidebar 
              requests={requests || []} 
              onIncidentClick={handleIncidentClick}
              onDetailsClick={handleDetailsClick}
              selectedRequest={selectedRequest}
            />
          </div>
        </aside>
        
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