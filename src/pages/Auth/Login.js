import React, { useState } from 'react';
import { Plane, Mail, Shield, Sparkles, Zap, Globe, CheckCircle, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Card from '../../components/UI/Card';
import toast from 'react-hot-toast';

const Login = () => {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);

  const { login, sendOtp } = useAuth();

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current box is empty, move to previous box
        setActiveOtpIndex(index - 1);
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveOtpIndex(index - 1);
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
    else if (e.key === 'ArrowRight' && index < 5) {
      setActiveOtpIndex(index + 1);
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    setActiveOtpIndex(Math.min(pastedData.length, 5));
    
    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    const nextInput = document.getElementById(`otp-${nextIndex}`);
    if (nextInput) nextInput.focus();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      console.log('Sending OTP to:', email); // Debug log
      const result = await sendOtp(email);
      console.log('SendOTP result:', result); // Debug log
      setLoading(false);

      if (result.success) {
        console.log('OTP sent successfully, changing step to otp'); // Debug log
        setStep('otp');
        setActiveOtpIndex(0);
        // Don't show toast here since it's already shown in sendOtp
      } else {
        console.log('OTP send failed:', result.message); // Debug log
        setErrors({ email: result.message });
      }
    } catch (error) {
      console.error('HandleSendOtp error:', error); // Debug log
      setLoading(false);
      setErrors({ email: 'Failed to send OTP. Please try again.' });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    const otpString = otp.join('');
    if (!otpString) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    if (otpString.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    console.log('Verifying OTP:', { email, otp: otpString }); // Debug log
    setLoading(true);
    
    try {
      const result = await login(email, otpString);
      console.log('Login result:', result); // Debug log
      setLoading(false);

      if (!result.success) {
        console.log('Login failed:', result.message); // Debug log
        setErrors({ otp: result.message });
      } else {
        console.log('Login successful, should redirect now'); // Debug log
      }
    } catch (error) {
      console.error('HandleVerifyOtp error:', error); // Debug log
      setLoading(false);
      setErrors({ otp: 'Verification failed. Please try again.' });
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setOtp(['', '', '', '', '', '']);
    setActiveOtpIndex(0);
    const result = await sendOtp(email);
    setLoading(false);

    if (!result.success) {
      toast.error(result.message);
    } else {
      // Focus first input after resend
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          
          {/* Left Side - Branding and Features (Smaller) */}
          <div className="lg:col-span-2 text-center lg:text-left space-y-6">
            {/* Logo and Title */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-4 transform hover:scale-110 transition-transform duration-300">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  Mail Pilot
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  Professional Email Management System
                </p>
                <p className="text-gray-500 mt-1 text-sm">
                  Streamline your email campaigns with intelligent automation
                </p>
              </div>
            </div>

            {/* Feature Highlights - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
              <div className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Lightning Fast</h3>
                  <p className="text-xs text-gray-600">Send thousands in seconds</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Smart Templates</h3>
                  <p className="text-xs text-gray-600">AI-powered templates</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Global Reach</h3>
                  <p className="text-xs text-gray-600">99.9% uptime guarantee</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Analytics</h3>
                  <p className="text-xs text-gray-600">Detailed insights</p>
                </div>
              </div>
            </div>

            {/* Stats - Compact */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">99.9%</div>
                <div className="text-xs text-gray-600 font-medium">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">10M+</div>
                <div className="text-xs text-gray-600 font-medium">Emails Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-xs text-gray-600 font-medium">Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form (Larger) */}
          <div className="lg:col-span-3 w-full max-w-2xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
              {step === 'email' ? (
                <>
                  {/* Email Step Header - Larger */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Mail className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3">Welcome Back</h2>
                      <p className="text-blue-100 text-lg">
                        Enter your email to receive a secure verification code
                      </p>
                    </div>
                  </div>

                  <div className="p-12 space-y-8">
                    <form onSubmit={handleSendOtp} className="space-y-8">
                      <div className="space-y-3">
                        <label htmlFor="email" className="block text-base font-semibold text-gray-700">
                          Email Address *
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-14 h-16 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl bg-gray-50 focus:bg-white transition-all duration-200"
                            required
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-2 flex items-center">
                            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-2">!</span>
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  {/* OTP Step Header - Compact & Professional */}
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Lock className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                      <p className="text-purple-100 text-sm mb-1">
                        We've sent a 6-digit code to
                      </p>
                      <p className="text-white font-semibold text-base">{email}</p>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      {/* Individual OTP Input Boxes */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 text-center">
                          Enter Verification Code
                        </label>
                        
                        <div className="flex justify-center space-x-3">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              maxLength={1}
                              value={otp[index]}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                handleOtpChange(value, index);
                              }}
                              onKeyDown={(e) => handleOtpKeyDown(e, index)}
                              onPaste={index === 0 ? handleOtpPaste : undefined}
                              className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                                otp[index] 
                                  ? 'border-purple-500 bg-purple-50 text-purple-800' 
                                  : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-purple-500 focus:bg-white'
                              }`}
                              autoFocus={index === 0}
                            />
                          ))}
                        </div>
                        
                        {errors.otp && (
                          <p className="text-red-500 text-sm mt-2 flex items-center justify-center">
                            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center mr-2">!</span>
                            {errors.otp}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Verify & Sign In</span>
                            <CheckCircle className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Action Links - Compact */}
                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email');
                          setOtp(['', '', '', '', '', '']);
                          setErrors({});
                          setActiveOtpIndex(0);
                        }}
                        className="text-gray-500 hover:text-gray-700 flex items-center space-x-1 hover:underline transition-colors"
                      >
                        <span>←</span>
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                      >
                        Resend Code
                      </button>
                    </div>

                    {/* Timer - Compact */}
                    <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-blue-800 font-medium">Expires in 10 minutes</span>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Trust Indicators - More Professional & Eye-catching */}
            <div className="mt-6 flex justify-center space-x-4">
              <div className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-full border border-green-200/50 hover:border-green-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-green-700 group-hover:text-green-800 transition-colors">Secure</span>
              </div>
              
              <div className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-full border border-blue-200/50 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-700 group-hover:text-blue-800 transition-colors">Fast</span>
              </div>
              
              <div className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-full border border-purple-200/50 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-purple-700 group-hover:text-purple-800 transition-colors">Reliable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;