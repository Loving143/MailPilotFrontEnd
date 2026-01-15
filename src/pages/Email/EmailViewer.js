import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { emailService } from '../../services/emailService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Mail, 
  Calendar, 
  User,
  Building,
  Phone,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Copy,
  ExternalLink,
  Edit3,
  Trash2,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

const EmailViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRawContent, setShowRawContent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEmailById(id);
    }
  }, [id]);

  const fetchEmailById = async (emailId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching email by ID:', emailId);
      
      // If the ID is not a real database ID (starts with 'email-'), 
      // we need to fetch all emails and find the one by index
      if (emailId.startsWith('email-')) {
        const index = parseInt(emailId.replace('email-', ''));
        const response = await emailService.fetchAllEmails();
        console.log('All emails response:', response);
        
        if (response && (response.code === '1' || response.status === '1') && response.data) {
          const emailData = response.data;
          if (Array.isArray(emailData) && emailData[index]) {
            setEmail(emailData[index]);
          } else {
            setError('Email not found');
          }
        } else if (response && Array.isArray(response) && response[index]) {
          setEmail(response[index]);
        } else {
          setError('Email not found');
        }
      } else {
        // Try to fetch by actual ID if your backend supports it
        const response = await emailService.fetchEmailById(emailId);
        console.log('Email fetch response:', response);
        
        if (response && (response.code === '1' || response.status === '1') && response.data) {
          setEmail(response.data);
        } else if (response && !response.code && !response.status) {
          // Handle direct response without wrapper
          setEmail(response);
        } else {
          setError('Email not found');
        }
      }
    } catch (error) {
      console.error('Failed to fetch email:', error);
      setError(`Failed to fetch email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this email log? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await emailService.deleteEmailById(id);
      if (response && (response.code === '1' || response.status === '1')) {
        toast.success('Email log deleted successfully');
        navigate('/email-logs');
      } else {
        toast.error('Failed to delete email log');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete email log');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'email_sent':
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'email_received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted_on_phone':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interview_scheduled':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'hired':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'email_sent':
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'error':
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'hired':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return { date: 'Unknown', time: 'Unknown' };
    
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      })
    };
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <LoadingSpinner />
          <p className="text-gray-500 mt-4">Loading email details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => navigate('/email-logs')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email Logs
          </Button>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Mail className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Email Data</h2>
          <p className="text-gray-600 mb-6">Unable to load email information</p>
          <Button 
            onClick={() => navigate('/email-logs')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Email Logs
          </Button>
        </div>
      </div>
    );
  }

  const dateTime = formatDate(email.sentAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/email-logs')}
              className="flex items-center space-x-2 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Logs</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Email Details
              </h1>
              <p className="text-gray-600 mt-1">View complete email information</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowRawContent(!showRawContent)}
              className="flex items-center space-x-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {showRawContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showRawContent ? 'Hide' : 'Show'} Raw Data</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              {deleting ? <LoadingSpinner /> : <Trash2 className="w-4 h-4" />}
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Email Status Card */}
        <Card className="overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Email Status</h2>
                  <p className="text-blue-100">Current delivery status</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {getStatusIcon(email.status)}
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold">
                  {formatStatus(email.status)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Email Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Email Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Subject and Recipient */}
            <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Subject</label>
                  <div className="flex items-center justify-between mt-2">
                    <h3 className="text-xl font-bold text-gray-900">{email.subject || 'No Subject'}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(email.subject || '', 'Subject')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Recipient</label>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{email.recipientEmail}</p>
                        {email.name && (
                          <p className="text-sm text-gray-600">{email.name}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(email.recipientEmail, 'Email address')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Email Body/Content - Only show if we have message content */}
            {(email.body || email.message) ? (
              <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Email Content</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(email.body || email.message, 'Email content')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    {(email.body || email.message)?.includes('<html>') || (email.body || email.message)?.includes('<div>') ? (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: email.body || email.message }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {email.body || email.message}
                      </pre>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Email Content</label>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-yellow-800 text-sm">
                        Email content is not available in the current API response. 
                        Consider adding the email body/message field to your EmailLogResponse.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Raw Data (if toggled) */}
            {showRawContent && (
              <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Raw Email Data</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(email, null, 2), 'Raw data')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono">
                      {JSON.stringify(email, null, 2)}
                    </pre>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            
            {/* Status Details */}
            <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Status Details</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Status</span>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(email.status)}`}>
                      {formatStatus(email.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email ID</span>
                    <span className="text-sm font-mono text-gray-900">{id}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Date & Time */}
            <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span>Timestamp</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Date</span>
                    <p className="font-semibold text-gray-900">{dateTime.date}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Time</span>
                    <p className="font-semibold text-gray-900">{dateTime.time}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            {(email.name || email.company || email.mobNo) && (
              <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-500" />
                    <span>Contact Info</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {email.name && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Name</span>
                        <span className="font-semibold text-gray-900">{email.name}</span>
                      </div>
                    )}
                    
                    {email.company && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Company</span>
                        <span className="font-semibold text-gray-900">{email.company}</span>
                      </div>
                    )}
                    
                    {email.mobNo && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Mobile</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{email.mobNo}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(email.mobNo, 'Mobile number')}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => window.open(`mailto:${email.recipientEmail}?subject=Re: ${email.subject}`, '_blank')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reply to Email
                  </Button>
                  
                  {email.mobNo && (
                    <Button
                      variant="outline"
                      className="w-full justify-start border-green-200 text-green-600 hover:bg-green-50"
                      onClick={() => window.open(`tel:${email.mobNo}`, '_blank')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Contact
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={() => navigate(`/email-logs`)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All Logs
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailViewer;