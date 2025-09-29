'use client';

import Image from 'next/image';
import { ServiceRequest } from '@/types/boston-311';
import { X, MapPin, Calendar, User, FileText, Camera } from 'lucide-react';

interface ServiceRequestModalProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusMap: (lat: number, lng: number) => void;
}

export function ServiceRequestModal({ request, isOpen, onClose, onFocusMap }: ServiceRequestModalProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{request.case_title}</h2>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="text-sm">#{request.case_enquiry_id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.case_status)}`}>
                  {request.case_status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.on_time)}`}>
                  {request.on_time}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Hero Section with Images */}
          {(request.submitted_photo || request.closed_photo) && (
            <div className="p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="text-gray-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Photos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {request.submitted_photo && (
                  <div className="relative group">
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                      Submitted
                    </div>
                    <Image
                      src={getImageUrl(request.submitted_photo) || ''}
                      alt="Submitted photo"
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
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
                      alt="Closed photo"
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
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
                  className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <MapPin size={16} />
                  View on Map
                </button>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
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
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
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
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
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