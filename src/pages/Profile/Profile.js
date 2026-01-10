import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  User, 
  Lock, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Shield
} from 'lucide-react';

const Profile = () => {
  const { user, updateUserProfile, uploadResume, checkResumeStatus, checkResumeStatusSync } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeStatusRefresh, setResumeStatusRefresh] = useState(0); // Force re-render
  const [hasResume, setHasResume] = useState(checkResumeStatusSync());

  // Check resume status on component mount and when user changes
  React.useEffect(() => {
    const checkStatus = async () => {
      console.log('Profile: Checking resume status...'); // Debug log
      try {
        const status = await checkResumeStatus();
        console.log('Profile: Resume status from backend:', status); // Debug log
        setHasResume(status);
      } catch (error) {
        console.error('Profile: Error checking resume status:', error);
        const fallbackStatus = checkResumeStatusSync();
        console.log('Profile: Fallback resume status:', fallbackStatus); // Debug log
        setHasResume(fallbackStatus);
      }
    };
    
    if (user) {
      checkStatus();
    }
  }, [user, resumeStatusRefresh, checkResumeStatus, checkResumeStatusSync]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setResumeFile(file);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file');
      return;
    }

    setResumeUploading(true);
    try {
      const result = await uploadResume(resumeFile);
      console.log('Upload result:', result); // Debug log
      
      if (result.success) {
        setResumeFile(null);
        // Reset file input
        const fileInput = document.getElementById('resumeFile');
        if (fileInput) fileInput.value = '';
        
        // Force re-render to update hasResume status
        setResumeStatusRefresh(prev => prev + 1);
        
        // Immediately update local state
        setHasResume(true);
      } else {
        toast.error(result.message || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Implement profile update logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // TODO: Implement password change logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Password changed successfully!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-lg text-gray-600 mt-2">Manage your account information and security</p>
          </div>
        </div>

        {/* Resume Status Alert */}
        {!hasResume && (
          <Card className="border-l-4 border-l-orange-500 bg-orange-50 border-orange-200">
            <div className="p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">Resume Required</h3>
                <p className="text-orange-700 text-sm mt-1">
                  You must upload your resume before you can send emails. Please upload your resume below.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Resume Upload Section */}
          <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Resume Management</h2>
                  <p className="text-green-100 text-sm mt-1">Upload your resume to enable email sending</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Resume Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  {hasResume ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {hasResume ? 'Resume Uploaded' : 'No Resume Uploaded'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {hasResume ? 'You can send emails' : 'Upload required to send emails'}
                    </p>
                  </div>
                </div>
                {hasResume && (
                  <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Active
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 mb-2">
                    {hasResume ? 'Update Resume' : 'Upload Resume'} *
                  </label>
                  <div className="relative">
                    <input
                      id="resumeFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="resumeFile"
                      className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          {resumeFile ? resumeFile.name : 'Click to upload resume'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOC, DOCX (Max 5MB)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {resumeFile && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{resumeFile.name}</span>
                    </div>
                    <Button
                      onClick={handleResumeUpload}
                      disabled={resumeUploading}
                      className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      {resumeUploading ? <LoadingSpinner /> : 'Upload'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Upload Guidelines */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">Upload Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Accepted formats: PDF, DOC, DOCX</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Ensure your resume is up-to-date</li>
                  <li>• Resume is required before sending emails</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Profile Information */}
          <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  <p className="text-blue-100 text-sm mt-1">Update your personal details</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? <LoadingSpinner /> : 'Update Profile'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Change Password Section */}
        <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Security Settings</h2>
                <p className="text-purple-100 text-sm mt-1">Update your password and security preferences</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handlePasswordChange} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="pl-12 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? <LoadingSpinner /> : 'Change Password'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;