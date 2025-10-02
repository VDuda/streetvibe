'use client';

import Image from 'next/image';
import { ServiceRequest } from '@/types/boston-311';
import { X, MapPin, Calendar, User, FileText } from 'lucide-react';

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
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-2">{request.case_title}</h2>
              <div className="flex items-center gap-3 text-blue-100">
                <span className="text-sm">#{request.case_enquiry_id}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.case_status)}`}>
                  {request.case_status}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Photos */}
          {(request.submitted_photo || request.closed_photo) && (
            <div className="p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Photos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.submitted_photo && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Submitted</div>
                    <Image
                      src={getImageUrl(request.submitted_photo) || ''}
                      alt="Submitted photo"
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {request.closed_photo && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Resolution</div>
                    <Image
                      src={getImageUrl(request.closed_photo) || ''}
                      alt="Resolution photo"
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="p-4 space-y-4">
            {/* Location */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="text-blue-600" size={16} />
                <h3 className="font-medium">Location</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{request.location}</p>
              {request.neighborhood && (
                <p className="text-xs text-gray-500 mb-2">Neighborhood: {request.neighborhood}</p>
              )}
              <button
                onClick={handleFocusMap}
                className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                View on Map
              </button>
            </div>

            {/* Timeline */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-green-600" size={16} />
                <h3 className="font-medium">Timeline</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Opened:</span> {formatDate(request.open_dt)}
                </div>
                {request.closed_dt && (
                  <div>
                    <span className="text-gray-500">Closed:</span> {formatDate(request.closed_dt)}
                  </div>
                )}
              </div>
            </div>

            {/* Department */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="text-purple-600" size={16} />
                <h3 className="font-medium">Department</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Department:</span> {request.department}
                </div>
                <div>
                  <span className="text-gray-500">Type:</span> {request.type}
                </div>
                <div>
                  <span className="text-gray-500">Source:</span> {request.source}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-orange-600" size={16} />
                <h3 className="font-medium">Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-500">Subject:</span> {request.subject}
                </div>
                <div>
                  <span className="text-gray-500">Reason:</span> {request.reason}
                </div>
                {request.closure_reason && (
                  <div>
                    <span className="text-gray-500">Closure Reason:</span> {request.closure_reason}
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