import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  Send, 
  Zap, 
  Mail, 
  User, 
  Building, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Sparkles,
  Globe,
  Upload
} from 'lucide-react';

const SendEmail = () => {
  const { checkResumeStatus, checkResumeStatusSync } = useAuth();
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    name: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [hasResume, setHasResume] = useState(checkResumeStatusSync());

  // Check resume status on component mount
  React.useEffect(() => {
    const checkStatus = async () => {
      console.log('SendEmail: Checking resume status...'); // Debug log
      try {
        const status = await checkResumeStatus();
        console.log('SendEmail: Resume status from backend:', status); // Debug log
        setHasResume(status);
      } catch (error) {
        console.error('SendEmail: Error checking resume status:', error);
        const fallbackStatus = checkResumeStatusSync();
        console.log('SendEmail: Fallback resume status:', fallbackStatus); // Debug log
        setHasResume(fallbackStatus);
      }
    };
    
    checkStatus();
  }, [checkResumeStatus, checkResumeStatusSync]);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      console.log('Testing API connection...');
      const response = await emailService.fetchAllEmails();
      console.log('Connection test response:', response);
      toast.success('API connection successful!');
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error(`API connection failed: ${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickSend = async () => {
    if (!hasResume) {
      toast.error('Please upload your resume first before sending emails');
      return;
    }

    if (!formData.to) {
      toast.error('Please enter recipient email');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Quick sending to:', formData.to); // Debug log
      
      // Try minimal QuickSendRequest structure
      const quickSendData = {
        recipientEmail: formData.to
      };
      
      console.log('Quick send data:', quickSendData); // Debug log
      
      const response = await emailService.quickSend(quickSendData);
      console.log('Quick send response:', response); // Debug log
      
      if (response && (response.code === '1' || response.status === '1' || response.success)) {
        toast.success('Quick message sent successfully!');
        setFormData({ to: '', subject: '', message: '', name: '', company: '' });
      } else {
        const errorMessage = response?.message || response?.data || 'Failed to send quick message';
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('Quick send error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data || 
                          error.message || 
                          'Failed to send quick message';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasResume) {
      toast.error('Please upload your resume first before sending emails');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Sending email with data:', formData); // Debug log
      
      // Prepare email data for the API based on backend structure
      const emailData = {
        recipientEmail: formData.to,
        subject: formData.subject,
        message: formData.message,
        name: formData.name,
        company: formData.company
      };
      
      console.log('Sending email with data:', emailData); // Debug log
      
      // Use the intent-based email method (matches backend /send/intent-email)
      // This seems to be the most appropriate endpoint for custom email sending
      let response;
      try {
        response = await emailService.sendIntentEmail(emailData);
        console.log('Intent email response:', response); // Debug log
      } catch (intentError) {
        console.log('Intent email failed, trying bulk send:', intentError);
        
        // If intent email fails, try the bulk send method (matches backend /send)
        try {
          const hrDetailsList = {
            hrDetails: [{
              email: formData.to,
              subject: formData.subject,
              message: formData.message,
              name: formData.name,
              company: formData.company,
              mobNo: '', // Add mobile number field if needed
              status: 'EMAIL_SENT' // Default status
            }]
          };
          
          response = await emailService.sendEmails(hrDetailsList);
          console.log('Bulk send response:', response); // Debug log
        } catch (bulkError) {
          console.log('Bulk send also failed:', bulkError);
          throw bulkError;
        }
      }
      
      // Check if the response indicates success
      if (response && (response.code === '1' || response.status === '1' || response.success || response.status === 'success')) {
        toast.success('Email sent successfully!');
        setFormData({ to: '', subject: '', message: '', name: '', company: '' });
      } else {
        const errorMessage = response?.message || response?.data || 'Failed to send email';
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('Email send error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data || 
                          error.message || 
                          'Failed to send email';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Send Email
            </h1>
            <p className="text-lg text-gray-600 mt-2">Compose and send professional emails with ease</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={testConnection}
              disabled={testingConnection}
              className="flex items-center space-x-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {testingConnection ? <LoadingSpinner /> : <Globe className="w-4 h-4" />}
              <span>Test Connection</span>
            </Button>
          </div>
        </div>

        {/* Resume Requirement Alert */}
        {!hasResume && (
          <Card className="border-l-4 border-l-red-500 bg-red-50 border-red-200">
            <div className="p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Resume Required</h3>
                <p className="text-red-700 text-sm mt-1">
                  You must upload your resume before you can send emails. Please go to your profile and upload your resume first.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
                  onClick={() => window.location.href = '/profile'}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Go to Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Main Email Form */}
        <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Compose Email</h2>
            </div>
            <p className="text-blue-100 mt-2">Fill in the details below to send your email</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Recipient Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recipient Information</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="relative">
                  <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="to"
                      name="to"
                      type="email"
                      value={formData.to}
                      onChange={handleChange}
                      placeholder="recipient@example.com"
                      className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company Name"
                        className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Content Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Email Content</h3>
              </div>

              <div className="relative">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter email subject"
                    className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    rows={8}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
                    required
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {formData.message.length} characters
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleQuickSend}
                disabled={loading || !formData.to || !hasResume}
                className="flex items-center justify-center space-x-2 h-12 px-6 border-yellow-200 text-yellow-700 hover:bg-yellow-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner /> : <Zap className="w-4 h-4" />}
                <span>Quick Send</span>
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading || !hasResume}
                className="flex items-center justify-center space-x-2 h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner /> : <Send className="w-4 h-4" />}
                <span>Send Email</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Reliable Delivery</h3>
            <p className="text-sm text-gray-600">99.9% delivery rate with real-time tracking</p>
          </Card>

          <Card className="p-6 text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Professional Templates</h3>
            <p className="text-sm text-gray-600">Beautiful, responsive email templates</p>
          </Card>

          <Card className="p-6 text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Analytics</h3>
            <p className="text-sm text-gray-600">Track opens, clicks, and engagement</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendEmail;