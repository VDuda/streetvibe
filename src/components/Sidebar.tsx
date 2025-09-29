import { ServiceRequest } from '@/types/boston-311';

interface SidebarProps {
  requests: ServiceRequest[];
  onRequestClick: (request: ServiceRequest) => void;
  selectedRequest?: ServiceRequest | null;
}

export function Sidebar({ requests, onRequestClick, selectedRequest }: SidebarProps) {
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
        return 'text-red-500';
      case 'closed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Boston</h1>
        <h2 className="text-3xl font-bold text-red-500">311 Call Stream</h2>
        <p className="text-sm text-gray-500 mt-4">
          This is a dataset of 311 calls from the City of Boston.
          Showing the 100 most recent incidents. Click any item for details.
        </p>
      </header>
      <ul>
        {requests.map((request) => {
          const isSelected = selectedRequest?.case_enquiry_id === request.case_enquiry_id;
          return (
            <li 
              key={request.case_enquiry_id} 
              className={`mb-6 border-b pb-4 cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-50 border-blue-200 shadow-md' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => onRequestClick(request)}
            >
            <div className="flex justify-between items-start mb-1">
              <p className="font-bold capitalize flex-1 mr-2">{request.case_title.toLowerCase()}</p>
              <span className={`text-xs font-medium ${getStatusColor(request.case_status)}`}>
                {request.case_status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{request.location}</p>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Opened: {formatDate(request.open_dt)}</span>
              {(request.submitted_photo || request.closed_photo) && (
                <span className="text-blue-500">📷 Has photos</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{request.department}</p>
          </li>
          );
        })}
      </ul>
    </div>
  );
}

