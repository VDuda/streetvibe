import { useState } from 'react';
import { ServiceRequest } from '@/types/boston-311';
import { Search, Filter, Clock, MapPin, Camera } from 'lucide-react';

interface SidebarProps {
  requests: ServiceRequest[];
  onRequestClick: (request: ServiceRequest) => void;
  selectedRequest?: ServiceRequest | null;
}

export function Sidebar({ requests, onRequestClick, selectedRequest }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      request.case_status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

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
        return 'text-red-600 bg-red-50 border-red-200';
      case 'closed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return '🔴';
      case 'closed':
        return '✅';
      case 'in_progress':
        return '🟡';
      default:
        return '⚫';
    }
  };

  return (
    <div>
      <header className="mb-4 lg:mb-6">
        <div className="mb-4 lg:mb-6 lg:block hidden">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Boston</h1>
          <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">311 Call Stream</h2>
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Real-time view of Boston's 311 service requests. 
            <span className="font-medium text-gray-700"> Showing {filteredRequests.length} of {requests.length} incidents.</span>
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="space-y-3 mb-4 lg:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
        </div>
      </header>

      <div className="space-y-2 lg:space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-6 lg:py-8 text-gray-500">
            <p className="text-sm">No incidents found matching your criteria.</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const isSelected = selectedRequest?.case_enquiry_id === request.case_enquiry_id;
            return (
              <div 
                key={request.case_enquiry_id} 
                className={`cursor-pointer p-3 lg:p-4 rounded-lg lg:rounded-xl transition-all duration-200 border ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-300 shadow-lg ring-2 ring-blue-200 ring-opacity-50' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md active:bg-gray-100'
                }`}
                onClick={() => onRequestClick(request)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 capitalize text-sm leading-tight flex-1 mr-3">
                    {request.case_title.toLowerCase()}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.case_status)} flex items-center gap-1`}>
                    <span>{getStatusIcon(request.case_status)}</span>
                    {request.case_status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={14} />
                    <p className="text-sm text-gray-600 leading-snug">{request.location}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock size={12} />
                      <span>{formatDate(request.open_dt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {(request.submitted_photo || request.closed_photo) && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Camera size={12} />
                          <span className="text-xs">Photos</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-1 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">{request.department}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}