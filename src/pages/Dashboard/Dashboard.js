import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  XCircle,
  Phone,
  Calendar,
  UserCheck,
  Zap,
  Target,
  BarChart3,
  Activity,
  Globe,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Settings,
  Star,
  Award,
  Rocket,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { emailService } from '../../services/emailService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalEmails: 0,
    totalEmailsGrowth: '+0%',
    sentToday: 0,
    sentTodayGrowth: '+0%',
    responseRate: 0,
    responseRateGrowth: '+0%',
    activeCampaigns: 0,
    activeCampaignsGrowth: '+0%'
  });
  const [detailedStats, setDetailedStats] = useState({
    statusBreakdown: {},
    uniqueCompanies: 0,
    averageResponseTime: '0 days',
    totalResponses: 0
  });
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard summary (includes both dashboard and detailed stats)
      const summaryResponse = await dashboardService.getDashboardSummary();
      console.log('Dashboard summary response:', summaryResponse);
      
      if (summaryResponse.status === '1' && summaryResponse.data) {
        const { dashboard, detailed } = summaryResponse.data;
        
        // Set dashboard stats
        setDashboardStats({
          totalEmails: dashboard.totalEmails || 0,
          totalEmailsGrowth: dashboard.totalEmailsGrowth || '+0%',
          sentToday: dashboard.sentToday || 0,
          sentTodayGrowth: dashboard.sentTodayGrowth || '+0%',
          responseRate: dashboard.responseRate || 0,
          responseRateGrowth: dashboard.responseRateGrowth || '+0%',
          activeCampaigns: dashboard.activeCampaigns || 0,
          activeCampaignsGrowth: dashboard.activeCampaignsGrowth || '+0%'
        });
        
        // Set detailed stats
        setDetailedStats({
          statusBreakdown: detailed.statusBreakdown || {},
          uniqueCompanies: detailed.uniqueCompanies || 0,
          averageResponseTime: detailed.averageResponseTime || '0 days',
          totalResponses: detailed.totalResponses || 0,
          sentThisWeek: detailed.sentThisWeek || 0,
          sentThisMonth: detailed.sentThisMonth || 0
        });
      }
      
      // Also fetch recent emails for activity section
      try {
        const emailResponse = await emailService.fetchAllEmails();
        if (emailResponse.code === '1' && emailResponse.data) {
          const sortedEmails = emailResponse.data
            .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
            .slice(0, 5);
          setRecentEmails(sortedEmails);
        }
      } catch (emailError) {
        console.error('Error fetching recent emails:', emailError);
        // Don't fail the whole dashboard if recent emails fail
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    setRefreshing(true);
    
    try {
      // Fetch stats for specific period
      const periodResponse = await dashboardService.getStatsByPeriod(period);
      console.log('Period stats response:', periodResponse);
      
      if (periodResponse.status === '1' && periodResponse.data) {
        const data = periodResponse.data;
        
        // Update detailed stats with period-specific data
        setDetailedStats(prev => ({
          ...prev,
          statusBreakdown: data.statusBreakdown || {},
          uniqueCompanies: data.uniqueCompanies || 0,
          averageResponseTime: data.averageResponseTime || '0 days',
          totalResponses: data.totalResponses || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching period stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EMAIL_SENT':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'EMAIL_RECEIVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'CONTACTED_ON_PHONE':
        return <Phone className="w-4 h-4 text-purple-500" />;
      case 'Interview_Scheduled':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'HIRED':
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'EMAIL_SENT': 'Email Sent',
      'EMAIL_RECEIVED': 'Email Received',
      'CONTACTED_ON_PHONE': 'Contacted On Phone',
      'Interview_Scheduled': 'Interview Scheduled',
      'HIRED': 'Hired',
      'REJECTED': 'Rejected'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 rounded-3xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-black/10 rounded-3xl pointer-events-none"></div>
          <div className="relative p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">
                      Welcome back, {user?.name || 'User'}! 🚀
                    </h1>
                    <p className="text-blue-100 text-lg mt-2">
                      Your email campaigns are performing exceptionally well today
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mt-6">
                  <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-medium">Live Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">Global Reach</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 flex space-x-3">
                <Button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm flex items-center space-x-2"
                >
                  {refreshing ? <LoadingSpinner /> : <RefreshCw className="w-4 h-4" />}
                  <span>Refresh</span>
                </Button>
                <Button 
                  onClick={() => navigate('/email/send')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Email</span>
                </Button>
                <Button 
                  onClick={() => navigate('/email/quick-send')}
                  className="bg-white text-blue-600 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Quick Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 ${dashboardStats.totalEmailsGrowth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardStats.totalEmailsGrowth.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="text-sm font-medium">{dashboardStats.totalEmailsGrowth}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Emails</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalEmails}</p>
                <p className="text-xs text-gray-500 mt-2">All time campaigns</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 ${dashboardStats.sentTodayGrowth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardStats.sentTodayGrowth.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="text-sm font-medium">{dashboardStats.sentTodayGrowth}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Sent Today</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.sentToday}</p>
                <p className="text-xs text-gray-500 mt-2">Daily performance</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 ${dashboardStats.responseRateGrowth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardStats.responseRateGrowth.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="text-sm font-medium">{dashboardStats.responseRateGrowth}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Response Rate</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.responseRate}%</p>
                <p className="text-xs text-gray-500 mt-2">Engagement metrics</p>
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 ${dashboardStats.activeCampaignsGrowth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardStats.activeCampaignsGrowth.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="text-sm font-medium">{dashboardStats.activeCampaignsGrowth}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.activeCampaigns}</p>
                <p className="text-xs text-gray-500 mt-2">Running campaigns</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions - Moved to Top/Middle - Enhanced */}
        <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
          <div className="relative p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Quick Actions</h3>
                    <p className="text-blue-100">Streamline your email workflow with one-click actions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-medium">Lightning Fast</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Target className="w-3 h-3" />
                    <span className="text-xs font-medium">One-Click Actions</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Button 
                  onClick={() => navigate('/email/send')}
                  className="h-20 w-full flex-col space-y-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0"
                >
                  <Send className="w-6 h-6" />
                  <span className="font-medium text-sm">Send New Email</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/email/quick-send')}
                  className="h-20 w-full flex-col space-y-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0"
                >
                  <Zap className="w-6 h-6" />
                  <span className="font-medium text-sm">Quick Send</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/email/logs')}
                  className="h-20 w-full flex-col space-y-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0"
                >
                  <Mail className="w-6 h-6" />
                  <span className="font-medium text-sm">View Logs</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/intents')}
                  className="h-20 w-full flex-col space-y-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0"
                >
                  <Target className="w-6 h-6" />
                  <span className="font-medium text-sm">Manage Intents</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Status Breakdown - Enhanced */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Campaign Analytics</h3>
                      <p className="text-sm text-gray-600">Real-time email status breakdown</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
                      >
                        {dashboardService.getAvailablePeriods().map((period) => (
                          <option key={period.value} value={period.value}>
                            {period.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {Object.keys(detailedStats.statusBreakdown).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(detailedStats.statusBreakdown).map(([status, count], index) => {
                      const totalEmails = Object.values(detailedStats.statusBreakdown).reduce((sum, val) => sum + val, 0);
                      const percentage = totalEmails > 0 ? Math.round((count / totalEmails) * 100) : 0;
                      return (
                        <div key={status} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(status)}
                              <span className="font-medium text-gray-700">
                                {getStatusLabel(status)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-500">{percentage}%</span>
                              <span className="font-bold text-gray-900">{count}</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-purple-600"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Additional Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <p className="text-2xl font-bold text-blue-600">{detailedStats.uniqueCompanies}</p>
                          <p className="text-sm text-blue-800">Unique Companies</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-xl">
                          <p className="text-2xl font-bold text-purple-600">{detailedStats.averageResponseTime}</p>
                          <p className="text-sm text-purple-800">Avg Response Time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Yet</h3>
                    <p className="text-gray-600 mb-6">Start sending emails to see your analytics</p>
                    <Button 
                      onClick={() => navigate('/email/send')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Send Your First Email
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Activity - Enhanced */}
          <div>
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                      <p className="text-sm text-gray-600">Latest email updates</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/email/logs')}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View All</span>
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {recentEmails.length > 0 ? (
                  <div className="space-y-4">
                    {recentEmails.map((email, index) => (
                      <div key={index} className="group flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getStatusIcon(email.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {email.recipientEmail}
                          </p>
                          <p className="text-sm text-gray-500">
                            {email.sentAt ? format(new Date(email.sentAt), 'MMM dd, HH:mm') : 'N/A'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            {getStatusLabel(email.status).split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No recent activity</p>
                    <p className="text-sm text-gray-500 mt-1">Your recent emails will appear here</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Achievement Section - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-gradient-to-br from-emerald-500 via-blue-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 pointer-events-none"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Email Champion</h3>
                <p className="text-blue-100 text-sm">You've sent over {dashboardStats.totalEmails} emails!</p>
                <div className="mt-4 flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-300 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 pointer-events-none"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">High Performer</h3>
                <p className="text-purple-100 text-sm">{dashboardStats.responseRate}% response rate achieved!</p>
                <div className="mt-4">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(dashboardStats.responseRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 pointer-events-none"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Productivity Master</h3>
                <p className="text-blue-100 text-sm">{dashboardStats.sentToday} emails sent today!</p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Active Today</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;