import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { emailService } from '../../services/emailService';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  Zap, 
  Mail, 
  Rocket, 
  Clock, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  Globe,
  Target,
  Send,
  AlertCircle,
  Upload
} from 'lucide-react';

const QuickSend = () => {
  const { checkResumeStatus, checkResumeStatusSync } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasResume, setHasResume] = useState(checkResumeStatusSync());

  // Check resume status on component mount
  React.useEffect(() => {
    const checkStatus = async () => {
      console.log('QuickSend: Checking resume status...'); // Debug log
      try {
        const status = await checkResumeStatus();
        console.log('QuickSend: Resume status from backend:', status); // Debug log
        setHasResume(status);
      } catch (error) {
        console.error('QuickSend: Error checking resume status:', error);
        const fallbackStatus = checkResumeStatusSync();
        console.log('QuickSend: Fallback resume status:', fallbackStatus); // Debug log
        setHasResume(fallbackStatus);
      }
    };
    
    checkStatus();
  }, [checkResumeStatus, checkResumeStatusSync]);

  const handleQuickSend = async (e) => {
    e.preventDefault();
    
    if (!hasResume) {
      toast.error('Please upload your resume first before sending emails');
      return;
    }
    
    if (!recipientEmail) {
      toast.error('Please enter recipient email');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Quick sending to:', recipientEmail); // Debug log
      
      // Try different structures for QuickSendRequest
      const quickSendData = {
        recipientEmail: recipientEmail.trim(),
        // Add other possible fields that QuickSendRequest might expect
        subject: 'Quick Send Message', // Default subject
        message: 'This is a quick send message', // Default message
        body: 'This is a quick send message',    // Backup field name
        name: '', // Optional name
        company: '' // Optional company
      };
      
      console.log('Quick send data:', quickSendData); // Debug log
      
      const response = await emailService.quickSend(quickSendData);
      console.log('Quick send response:', response); // Debug log
      
      if (response && (response.code === '1' || response.status === '1' || response.success)) {
        toast.success('Quick message sent successfully!');
        setRecipientEmail('');
      } else {
        const errorMessage = response?.message || response?.data || 'Failed to send quick message';
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('Quick send error:', error);
      console.error('Error response:', error.response); // Debug log
      console.error('Error response data:', error.response?.data); // Debug log
      console.error('Error response status:', error.response?.status); // Debug log
      
      // Extract the actual error message from different possible response structures
      let errorMessage = 'Failed to send quick message';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for different error message formats
        if (typeof errorData === 'string') {
          // Sometimes the error message is directly in the response data as a string
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.data) {
          errorMessage = errorData.data;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.details) {
          errorMessage = errorData.details;
        }
        
        // Handle Spring Boot error format
        if (errorData.timestamp && errorData.status && errorData.error) {
          errorMessage = errorData.message || errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Clean up the error message (remove technical details if present)
      if (errorMessage.includes('RuntimeException')) {
        // Extract just the message part after the exception type
        const match = errorMessage.match(/RuntimeException.*?:\s*(.+)/);
        if (match) {
          errorMessage = match[1];
        }
      }
      
      console.log('Final error message to show:', errorMessage); // Debug log
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section - Compact */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quick Send
            </h1>
            <p className="text-gray-600 mt-1">Lightning-fast email delivery with predefined templates</p>
          </div>
          
          {/* Speed Indicator - Compact */}
          <div className="inline-flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full text-sm">
            <Rocket className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-blue-700">Ultra-fast delivery in seconds</span>
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

        {/* Main Quick Send Form - Compact */}
        <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Quick Send Message</h2>
                  <p className="text-blue-100 text-sm mt-1">Send instant messages using smart templates</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">~2 seconds</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleQuickSend} className="p-6 space-y-6">
            
            {/* Recipient Section - Compact */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Target Recipient</h3>
              </div>
              
              <div className="relative">
                <label htmlFor="recipientEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipient Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="recipientEmail"
                    name="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter recipient's email address"
                    className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {recipientEmail && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Template Info Section - Compact */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-2">Smart Template System</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Our Quick Send feature uses intelligent, predefined message templates optimized for professional communication. 
                    The message content is automatically managed by our backend system.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-gray-600">Professional tone</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-gray-600">Optimized delivery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-gray-600">High engagement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button - Compact */}
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                disabled={loading || !recipientEmail || !hasResume}
                className="flex items-center justify-center space-x-2 h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Send Quick Message</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Features Grid - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 text-center border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Lightning Speed</h3>
            <p className="text-gray-600 text-sm">Messages delivered in under 2 seconds</p>
          </Card>

          <Card className="p-4 text-center border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Smart Templates</h3>
            <p className="text-gray-600 text-sm">AI-powered templates that adapt to context</p>
          </Card>

          <Card className="p-4 text-center border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 hover:shadow-lg hover:scale-105">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Global Reach</h3>
            <p className="text-gray-600 text-sm">Reliable delivery worldwide with 99.9% uptime</p>
          </Card>
        </div>

        {/* Process Steps - Compact */}
        <Card className="p-6 border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">How Quick Send Works</h3>
            <p className="text-gray-600 text-sm">Simple, fast, and effective in just 3 steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Enter Email</h4>
              <p className="text-gray-600 text-xs">Simply enter the recipient's email address</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Auto Template</h4>
              <p className="text-gray-600 text-xs">Our system selects the perfect template</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">Instant Send</h4>
              <p className="text-gray-600 text-xs">Message delivered in seconds</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuickSend;