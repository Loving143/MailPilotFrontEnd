import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailService } from '../../services/emailService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import { toast } from 'react-hot-toast';
import { 
  Mail, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Edit3,
  Save,
  X,
  Eye
} from 'lucide-react';

const EmailLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Status update state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [exporting, setExporting] = useState(false);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      console.log('Testing API connection for email logs...');
      const response = await emailService.fetchAllEmails();
      console.log('Connection test response:', response);
      if (response) {
        toast.success('API connection successful!');
        
        // Also test Excel generation API
        console.log('Testing Excel generation API...');
        try {
          const excelResponse = await emailService.generateExcel();
          console.log('Excel API test response:', excelResponse);
          console.log('Excel response type:', typeof excelResponse.data);
          console.log('Excel response size:', excelResponse.data?.size);
          console.log('Excel response headers:', excelResponse.headers);
          toast.success('Excel API also working!');
        } catch (excelError) {
          console.error('Excel API test failed:', excelError);
          toast.error('Excel API test failed - check console for details');
        }
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error(`API connection failed: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching email logs...'); // Debug log
      const response = await emailService.fetchAllEmails();
      console.log('Email logs response:', response); // Debug log
      
      if (response && (response.code === '1' || response.status === '1') && response.data) {
        // Backend returns ApiResponse with code "1" and data containing the email logs
        const emailData = response.data;
        console.log('Email data:', emailData); // Debug log
        
        // Map the backend response to frontend format
        const mappedLogs = Array.isArray(emailData) ? emailData.map((log, index) => ({
          id: log.id || `email-${index}`, // Use log.id if available, otherwise create a unique identifier
          to: log.recipientEmail || log.email || 'Unknown', // Use recipientEmail from EmailLogResponse
          subject: log.subject || 'No Subject',
          status: log.status ? log.status.toLowerCase().replace('_', ' ') : 'unknown',
          timestamp: log.sentAt || new Date().toISOString(), // Use sentAt from EmailLogResponse
          name: log.name || '',
          company: log.company || '',
          mobNo: log.mobNo || '',
          // Store the original data for the viewer
          originalData: log
        })) : [];
        
        console.log('Mapped logs:', mappedLogs); // Debug log
        setLogs(mappedLogs);
      } else if (response && Array.isArray(response)) {
        // Handle case where response is directly an array
        const mappedLogs = response.map((log, index) => ({
          id: log.id || `email-${index}`,
          to: log.recipientEmail || log.email || 'Unknown',
          subject: log.subject || 'No Subject',
          status: log.status ? log.status.toLowerCase().replace('_', ' ') : 'unknown',
          timestamp: log.sentAt || new Date().toISOString(),
          name: log.name || '',
          company: log.company || '',
          mobNo: log.mobNo || '',
          // Store the original data for the viewer
          originalData: log
        }));
        setLogs(mappedLogs);
      } else {
        console.log('No email logs found or invalid response format');
        setLogs([]);
        setError('No email logs found');
      }
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
      setError(`Failed to fetch email logs: ${error.message}`);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'email sent':
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and paginate logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'email sent':
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Status update functions
  const handleStatusUpdate = (email) => {
    setSelectedEmail(email);
    setNewStatus(email.status);
    setShowStatusModal(true);
  };

  const updateEmailStatus = async () => {
    if (!selectedEmail || !newStatus) return;

    setUpdatingStatus(true);
    try {
      // Prepare data for status update API - fix the structure
      const updateData = [{
        email: selectedEmail.to,
        status: newStatus,
        mobNo: selectedEmail.mobNo || ''
      }];

      console.log('Updating email status with data:', updateData); // Debug log

      const response = await emailService.updateEmailStatus(updateData);
      console.log('Status update response:', response); // Debug log
      
      if (response && (response.code === '1' || response.status === '1')) {
        // Update the local state
        setLogs(prevLogs => 
          prevLogs.map(log => 
            log.id === selectedEmail.id 
              ? { ...log, status: newStatus }
              : log
          )
        );
        
        toast.success('Email status updated successfully!');
        setShowStatusModal(false);
        setSelectedEmail(null);
      } else {
        const errorMessage = response?.message || response?.data || 'Failed to update email status';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Status update error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data || 
                          error.message || 
                          'Failed to update email status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getAvailableStatuses = () => {
    return emailService.getEmailStatuses();
  };

  // Export functions
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      console.log('Exporting emails to Excel...');
      const response = await emailService.generateExcel();
      console.log('Excel export response:', response); // Debug log
      
      // Check if we got a proper response
      if (response && response.data) {
        // Create blob with proper MIME type for Excel
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `email_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Excel file downloaded successfully!');
      } else {
        console.error('Invalid response from Excel export API:', response);
        toast.error('Invalid response from server. Please try again.');
      }
    } catch (error) {
      console.error('Excel export error:', error);
      
      // Check if the error response contains useful information
      if (error.response) {
        console.error('Error response:', error.response);
        const errorMessage = error.response.data?.message || 
                            error.response.data?.data || 
                            `Server error: ${error.response.status}`;
        toast.error(`Failed to export Excel file: ${errorMessage}`);
      } else {
        toast.error('Failed to export Excel file. Please check your connection.');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      console.log('Exporting emails to CSV...');
      // Use filtered logs for export (respects current search/filter)
      emailService.exportAsCSV(filteredLogs);
      toast.success('CSV file downloaded successfully!');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV file');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Email Logs</h1>
            <p className="text-xl text-gray-600 mt-2">Track and monitor your email delivery history</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Export Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleExportCSV}
                disabled={logs.length === 0}
                className="flex items-center space-x-2 border-green-200 text-green-600 hover:bg-green-50"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportExcel}
                disabled={exporting || logs.length === 0}
                className="flex items-center space-x-2 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                {exporting ? <LoadingSpinner /> : <Download className="w-4 h-4" />}
                <span>Export Excel</span>
              </Button>
            </div>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={testingConnection}
              className="flex items-center space-x-2 border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              {testingConnection ? <LoadingSpinner /> : <Download className="w-4 h-4" />}
              <span>Test API</span>
            </Button>
            <Button 
              onClick={fetchLogs} 
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? <LoadingSpinner /> : <Mail className="w-4 h-4" />}
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter(log => log.status.toLowerCase().includes('sent')).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter(log => log.status.toLowerCase().includes('failed')).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-purple-600">
                  {logs.filter(log => log.status.toLowerCase().includes('pending')).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between lg:justify-end gap-4">
              <div className="text-sm text-gray-600">
                Showing {paginatedLogs.length} of {filteredLogs.length} emails
              </div>
              
              {/* Export Actions */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Export:</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={filteredLogs.length === 0}
                  className="flex items-center space-x-1 border-green-200 text-green-600 hover:bg-green-50"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportExcel}
                  disabled={exporting || logs.length === 0}
                  className="flex items-center space-x-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  {exporting ? <LoadingSpinner /> : <Download className="w-3 h-3" />}
                  <span>Excel</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Email Logs Table */}
        <Card className="overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl">
          {loading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <LoadingSpinner />
              <p className="text-gray-500 mt-4">Loading email logs...</p>
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-gray-500 text-xl font-medium">No email logs found</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Send some emails to see them here'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedLogs.map((log, index) => {
                      const dateTime = formatDate(log.timestamp);
                      return (
                        <tr key={log.id} className="hover:bg-blue-25 transition-colors duration-150">
                          <td className="px-6 py-6">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
                                <Mail className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{log.to}</p>
                                {log.name && (
                                  <p className="text-xs text-gray-500">{log.name}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="max-w-xs">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {log.subject}
                              </p>
                              {log.company && (
                                <p className="text-xs text-gray-500 mt-1">{log.company}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(log.status)}
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(log.status)}`}>
                                {log.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{dateTime.date}</p>
                                <p className="text-xs text-gray-500">{dateTime.time}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/email-viewer/${log.id}`)}
                                className="flex items-center space-x-1 text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(log)}
                                className="flex items-center space-x-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Update Status</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center space-x-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center space-x-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Status Update Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedEmail(null);
            setNewStatus('');
          }}
          title="Update Email Status"
        >
          {selectedEmail && (
            <div className="space-y-6">
              {/* Email Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedEmail.to}</p>
                    <p className="text-sm text-gray-600">{selectedEmail.subject}</p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedEmail.status)}
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(selectedEmail.status)}`}>
                    {selectedEmail.status}
                  </span>
                </div>
              </div>

              {/* New Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status To
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getAvailableStatuses().map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedEmail(null);
                    setNewStatus('');
                  }}
                  disabled={updatingStatus}
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateEmailStatus}
                  disabled={updatingStatus || newStatus === selectedEmail.status}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2"
                >
                  {updatingStatus ? (
                    <>
                      <LoadingSpinner />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update Status</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default EmailLogs;