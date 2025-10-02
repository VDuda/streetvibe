import { ServiceRequest } from '@/types/boston-311';
import { Info } from 'lucide-react';

interface SidebarProps {
  requests: ServiceRequest[];
  onIncidentClick: (request: ServiceRequest) => void;
  onDetailsClick: (request: ServiceRequest, e: React.MouseEvent) => void;
  selectedRequest?: ServiceRequest | null;
}

export function Sidebar({ requests, onIncidentClick, onDetailsClick, selectedRequest }: SidebarProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-4">
      <div className="space-y-3">
        {requests.map((request) => {
          const isSelected = selectedRequest?.case_enquiry_id === request.case_enquiry_id;
          return (
            <div 
              key={request.case_enquiry_id} 
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                isSelected 
                  ? 'border-blue-300 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onIncidentClick(request)}
            >
              {/* Header with time and status */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">
                    {formatDate(request.open_dt)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(request.case_status)}`}>
                    {request.case_status}
                  </span>
                </div>
                <button
                  onClick={(e) => onDetailsClick(request, e)}
                  className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors opacity-60 hover:opacity-100"
                  title="View details"
                >
                  <Info size={12} />
                </button>
              </div>
              
              {/* Title */}
              <h3 className="font-medium text-gray-900 text-sm mb-1">
                {request.case_title}
              </h3>
              
              {/* Description/Subject */}
              {request.subject && (
                <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                  {truncateText(request.subject, 120)}
                </p>
              )}
              
              {/* Location */}
              <p className="text-sm text-gray-600 mb-2">
                📍 {truncateText(request.location, 50)}
              </p>
              
              {/* Department and extras */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="font-medium">{request.department}</span>
                <div className="flex items-center gap-2">
                  {(request.submitted_photo || request.closed_photo) && (
                    <span className="text-blue-600">📷</span>
                  )}
                  <span>#{request.case_enquiry_id}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}