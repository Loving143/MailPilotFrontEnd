import api from './api';

export const emailService = {
  // Send emails to multiple recipients
  sendEmails: async (hrDetailsList) => {
    const response = await api.post('/email/send', hrDetailsList);
    return response.data;
  },

  // Update email status
  updateEmailStatus: async (hrDetailsList) => {
    // The backend expects { hrDetails: [...] } structure
    const requestData = { hrDetails: hrDetailsList };
    console.log('Sending status update request:', JSON.stringify(requestData, null, 2)); // Debug log
    const response = await api.put('/email/update/status', requestData);
    return response.data;
  },

  // Generate and download Excel report
  generateExcel: async () => {
    try {
      const response = await api.get('/email/generate/excel', {
        responseType: 'blob', // Important for file downloads
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*'
        }
      });
      
      console.log('Excel API response:', response); // Debug log
      console.log('Response headers:', response.headers); // Debug log
      console.log('Response data type:', typeof response.data); // Debug log
      console.log('Response data size:', response.data.size); // Debug log
      
      return response;
    } catch (error) {
      console.error('Excel generation API error:', error);
      
      // If the API returns an error in JSON format, try to parse it
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          console.log('Error response text:', text);
          
          // Try to parse as JSON to get error message
          try {
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || errorData.data || 'Excel generation failed');
          } catch (parseError) {
            throw new Error(text || 'Excel generation failed');
          }
        } catch (textError) {
          throw error;
        }
      }
      
      throw error;
    }
  },

  // Export emails as CSV (client-side conversion)
  exportAsCSV: (emailData) => {
    const headers = ['Recipient Email', 'Subject', 'Status', 'Date & Time', 'Name', 'Company', 'Mobile'];
    const csvContent = [
      headers.join(','),
      ...emailData.map(email => [
        `"${email.recipientEmail || email.to || ''}"`,
        `"${email.subject || ''}"`,
        `"${email.status || ''}"`,
        `"${email.sentAt || email.timestamp || ''}"`,
        `"${email.name || ''}"`,
        `"${email.company || ''}"`,
        `"${email.mobNo || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `email_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Add HR details
  addHrDetails: async (hrDetailsList) => {
    const response = await api.post('/email/add/hrDetails', { hrDetails: hrDetailsList });
    return response.data;
  },

  // Quick send using recent email template
  quickSend: async (quickSendData) => {
    const response = await api.post('/email/quick-send', quickSendData);
    return response.data;
  },

  // Send intent-based email
  sendIntentEmail: async (emailData) => {
    const response = await api.post('/email/send/intent-email', emailData);
    return response.data;
  },

  // Fetch all emails for current user
  fetchAllEmails: async () => {
    const response = await api.get('/email/fetch/all');
    return response.data;
  },

  // Fetch specific email by ID
  fetchEmailById: async (id) => {
    const response = await api.get(`/email/fetch/${id}`);
    return response.data;
  },

  // Delete email log
  deleteEmailById: async (id) => {
    const response = await api.delete(`/email/delete/${id}`);
    return response.data;
  },

  // Get email status options
  getEmailStatuses: () => [
    { value: 'EMAIL_SENT', label: 'Email Sent' },
    { value: 'EMAIL_RECEIVED', label: 'Email Received' },
    { value: 'CONTACTED_ON_PHONE', label: 'Contacted On Phone' },
    { value: 'Interview_Scheduled', label: 'Interview Scheduled' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'HIRED', label: 'Hired' }
  ]
};