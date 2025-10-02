'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { ServiceRequest } from '@/types/boston-311';
import { X, MapPin, Calendar, User, FileText, Camera } from 'lucide-react';

interface ServiceRequestModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusMap: (lat: number, lng: number) => void;
}

export function ServiceRequestModal({ request, isOpen, onClose, onFocusMap }: ServiceRequestModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus management
      closeButtonRef.current?.focus();
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !request) return null;

  const handleFocusMap = () => {
    const lat = parseFloat(request.latitude);
    const lng = parseFloat(request.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      onFocusMap(lat, lng);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    return url.split('#')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (onTime: string) => {
    return onTime === 'ONTIME' 
      ? 'bg-green-50 text-green-700' 
      : 'bg-orange-50 text-orange-700';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 id="modal-title" className="text-lg sm:text-2xl font-bold mb-2 pr-2">{request.case_title}</h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-blue-100">
                <span className="text-xs sm:text-sm">#{request.case_enquiry_id}</span>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.case_status)}`}>
                  {request.case_status}
                </span>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.on_time)}`}>
                  {request.on_time}
                </span>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
          {/* Hero Section with Images */}
          {(request.submitted_photo || request.closed_photo) && (
            <div className="p-4 sm:p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="text-gray-600" size={18} />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Photos</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {request.submitted_photo && (
                  <div className="relative group">
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                      Submitted
                    </div>
                    <Image
                      src={getImageUrl(request.submitted_photo) || ''}
                      alt="Submitted photo for incident"
                      width={400}
                      height={300}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {request.closed_photo && (
                  <div className="relative group">
                    <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                      Resolution
                    </div>
                    <Image
                      src={getImageUrl(request.closed_photo) || ''}
                      alt="Resolution photo for incident"
                      width={400}
                      height={300}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) parent.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Location Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Location</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{request.location}</p>
                </div>
                {request.neighborhood && (
                  <div>
                    <p className="text-sm text-gray-500">Neighborhood</p>
                    <p className="font-medium">{request.neighborhood}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ZIP Code</p>
                    <p className="font-medium">{request.location_zipcode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="text-xs font-mono">{request.latitude}, {request.longitude}</p>
                  </div>
                </div>
                <button
                  onClick={handleFocusMap}
                  className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center gap-2 active:scale-95"
                >
                  <MapPin size={16} />
                  View on Map
                </button>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-500">Opened</p>
                    <p className="font-medium">{formatDate(request.open_dt)}</p>
                  </div>
                </div>
                {request.sla_target_dt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-500">Target Resolution</p>
                      <p className="font-medium">{formatDate(request.sla_target_dt)}</p>
                    </div>
                  </div>
                )}
                {request.closed_dt && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm text-gray-500">Closed</p>
                      <p className="font-medium">{formatDate(request.closed_dt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-purple-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Department Info</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{request.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Request Type</p>
                  <p className="font-medium">{request.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium">{request.source}</p>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-orange-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">{request.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="font-medium">{request.reason}</p>
                </div>
                {request.closure_reason && (
                  <div>
                    <p className="text-sm text-gray-500">Closure Reason</p>
                    <p className="font-medium">{request.closure_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}