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
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
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
    <div>
      <div className="space-y-3">
        {requests.map((request) => {
          const isSelected = selectedRequest?.case_enquiry_id === request.case_enquiry_id;
          return (
            <div 
              key={request.case_enquiry_id} 
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onIncidentClick(request)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 text-sm flex-1 mr-2">
                  {request.case_title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.case_status)}`}>
                    {request.case_status}
                  </span>
                  <button
                    onClick={(e) => onDetailsClick(request, e)}
                    className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                    title="View details"
                  >
                    <Info size={14} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{request.location}</p>
              
              {request.subject && (
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{request.subject}</p>
              )}
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Opened: {formatDate(request.open_dt)}</span>
                {(request.submitted_photo || request.closed_photo) && (
                  <span className="text-blue-600">📷 Photos</span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {request.department}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}