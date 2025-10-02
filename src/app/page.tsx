'use client';

import { useState, useRef } from 'react';
import { MapComponent } from '@/components/Map';
import { Sidebar } from '@/components/Sidebar';
import { ServiceRequestModal } from '@/components/ServiceRequestModal';
import { use311Data } from '@/hooks/use-311-data';
import { ServiceRequest } from '@/types/boston-311';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const { data: requests, isLoading, error } = use311Data();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mapRef = useRef<{ focusOnLocation: (lat: number, lng: number) => void } | null>(null);

  const handleRequestClick = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
    setIsSidebarOpen(false); // Close sidebar on mobile when opening modal
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading Boston 311 data...</div>
          <div className="text-sm text-gray-500 mt-1">Fetching recent service requests</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl font-semibold text-red-700 mb-2">Failed to Load Data</div>
          <div className="text-red-600 mb-4">Error fetching data: {error.message}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between z-30 relative">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Boston 311</h1>
          <p className="text-sm text-gray-600">{requests?.length || 0} incidents</p>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full">
        <aside className="w-[400px] p-6 overflow-y-auto border-r border-gray-200 bg-white shadow-lg">
          <Sidebar 
            requests={requests || []} 
            onRequestClick={handleRequestClick}
            selectedRequest={selectedRequest}
          />
        </aside>
        <main className="flex-1 relative">
          <MapComponent 
            ref={mapRef}
            requests={requests || []} 
            selectedRequest={selectedRequest}
            onMarkerClick={handleRequestClick}
          />
          
          {/* Desktop Stats Overlay */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{requests?.length || 0}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {requests?.filter(r => r.case_status.toLowerCase() === 'open').length || 0}
                </div>
                <div className="text-xs text-gray-500">Open</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {requests?.filter(r => r.case_status.toLowerCase() === 'closed').length || 0}
                </div>
                <div className="text-xs text-gray-500">Closed</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-full flex flex-col">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleSidebar}></div>
            <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Incidents</h2>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <Sidebar 
                  requests={requests || []} 
                  onRequestClick={handleRequestClick}
                  selectedRequest={selectedRequest}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Map */}
        <main className="flex-1 relative">
          <MapComponent 
            ref={mapRef}
            requests={requests || []} 
            selectedRequest={selectedRequest}
            onMarkerClick={handleRequestClick}
          />
          
          {/* Mobile Stats Card */}
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10 border border-gray-200">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{requests?.length || 0}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {requests?.filter(r => r.case_status.toLowerCase() === 'open').length || 0}
                </div>
                <div className="text-xs text-gray-500">Open</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {requests?.filter(r => r.case_status.toLowerCase() === 'closed').length || 0}
                </div>
                <div className="text-xs text-gray-500">Closed</div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <ServiceRequestModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFocusMap={handleFocusMap}
      />
    </div>
  );
}


