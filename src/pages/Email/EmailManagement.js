import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, FileText, Mail, Users, TrendingUp, Clock } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const EmailManagement = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Send Bulk Emails',
      description: 'Send personalized emails to multiple recipients with resume attachments',
      icon: Send,
      color: 'blue',
      action: () => navigate('/email/send'),
      buttonText: 'Send Emails'
    },
    {
      title: 'Email Logs',
      description: 'Track and manage all sent emails with status updates',
      icon: FileText,
      color: 'green',
      action: () => navigate('/email/logs'),
      buttonText: 'View Logs'
    },
    {
      title: 'Quick Send',
      description: 'Quickly send emails using your recent email template',
      icon: Mail,
      color: 'purple',
      action: () => {
        // This could open a modal for quick send
        navigate('/email/send?mode=quick');
      },
      buttonText: 'Quick Send'
    },
    {
      title: 'Intent-Based Emails',
      description: 'Send targeted emails based on predefined intent templates',
      icon: Users,
      color: 'orange',
      action: () => navigate('/intents'),
      buttonText: 'Manage Intents'
    }
  ];

  const stats = [
    { label: 'Total Emails Sent', value: '1,234', icon: Mail, color: 'blue' },
    { label: 'Response Rate', value: '23%', icon: TrendingUp, color: 'green' },
    { label: 'Pending Responses', value: '45', icon: Clock, color: 'orange' },
    { label: 'Active Campaigns', value: '8', icon: Users, color: 'purple' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-blue-50 to-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-600',
        textDark: 'text-blue-900',
        iconBg: 'bg-blue-500'
      },
      green: {
        bg: 'from-green-50 to-green-100',
        border: 'border-green-200',
        text: 'text-green-600',
        textDark: 'text-green-900',
        iconBg: 'bg-green-500'
      },
      purple: {
        bg: 'from-purple-50 to-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-600',
        textDark: 'text-purple-900',
        iconBg: 'bg-purple-500'
      },
      orange: {
        bg: 'from-orange-50 to-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-600',
        textDark: 'text-orange-900',
        iconBg: 'bg-orange-500'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Email Management</h1>
        <p className="text-primary-100">
          Manage your email campaigns, track performance, and engage with your audience.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <Card key={index} className={`bg-gradient-to-br ${colorClasses.bg} ${colorClasses.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${colorClasses.text}`}>{stat.label}</p>
                  <p className={`text-2xl font-bold ${colorClasses.textDark}`}>{stat.value}</p>
                </div>
                <div className={`p-3 ${colorClasses.iconBg} rounded-full`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const colorClasses = getColorClasses(feature.color);
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className={`p-3 ${colorClasses.iconBg} rounded-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    {feature.description}
                  </p>
                  <Button onClick={feature.action} size="sm">
                    {feature.buttonText}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Email Activity</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    Bulk email campaign completed
                  </p>
                  <p className="text-xs text-secondary-500">
                    Sent to 25 recipients • 2 hours ago
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    New email response received
                  </p>
                  <p className="text-xs text-secondary-500">
                    From john@company.com • 4 hours ago
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Response
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    Interview scheduled
                  </p>
                  <p className="text-xs text-secondary-500">
                    With TechCorp Inc. • 1 day ago
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Calendar
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-16 flex items-center justify-center space-x-2"
              onClick={() => navigate('/email/send')}
            >
              <Send className="w-5 h-5" />
              <span>Compose Email</span>
            </Button>
            
            <Button 
              variant="secondary"
              className="h-16 flex items-center justify-center space-x-2"
              onClick={() => navigate('/email/logs')}
            >
              <FileText className="w-5 h-5" />
              <span>View All Logs</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-16 flex items-center justify-center space-x-2"
              onClick={() => {
                // Generate Excel report
                console.log('Generate Excel report');
              }}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Export Report</span>
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default EmailManagement;