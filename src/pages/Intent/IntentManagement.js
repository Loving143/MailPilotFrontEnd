import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';

const IntentManagement = () => {
  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntent, setEditingIntent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: '',
    response: ''
  });

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      // TODO: Fetch intents from API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIntents([
        {
          id: 1,
          name: 'Greeting',
          description: 'Handle greeting messages',
          keywords: 'hello, hi, hey, good morning',
          response: 'Hello! How can I help you today?',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Support Request',
          description: 'Handle support inquiries',
          keywords: 'help, support, issue, problem',
          response: 'I understand you need help. Let me connect you with our support team.',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } catch (error) {
      toast.error('Failed to fetch intents');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement intent save logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      if (editingIntent) {
        toast.success('Intent updated successfully!');
      } else {
        toast.success('Intent created successfully!');
      }
      
      setShowModal(false);
      setEditingIntent(null);
      setFormData({ name: '', description: '', keywords: '', response: '' });
      fetchIntents();
    } catch (error) {
      toast.error('Failed to save intent');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (intent) => {
    setEditingIntent(intent);
    setFormData({
      name: intent.name,
      description: intent.description,
      keywords: intent.keywords,
      response: intent.response
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this intent?')) {
      return;
    }

    try {
      // TODO: Implement intent delete logic
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      toast.success('Intent deleted successfully!');
      fetchIntents();
    } catch (error) {
      toast.error('Failed to delete intent');
    }
  };

  const openCreateModal = () => {
    setEditingIntent(null);
    setFormData({ name: '', description: '', keywords: '', response: '' });
    setShowModal(true);
  };

  if (loading && intents.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Intent Management</h1>
          <p className="text-secondary-600 mt-1">Manage AI intents and responses</p>
        </div>
        <Button onClick={openCreateModal}>
          Create Intent
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Keywords
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {intents.map((intent) => (
                <tr key={intent.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                    {intent.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-500">
                    {intent.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-500">
                    <div className="max-w-xs truncate">
                      {intent.keywords}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {new Date(intent.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(intent)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(intent.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingIntent ? 'Edit Intent' : 'Create Intent'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
              Intent Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter intent name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <Input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this intent handles"
              required
            />
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-secondary-700 mb-1">
              Keywords (comma-separated)
            </label>
            <Input
              id="keywords"
              name="keywords"
              type="text"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3"
              required
            />
          </div>

          <div>
            <label htmlFor="response" className="block text-sm font-medium text-secondary-700 mb-1">
              Response Template
            </label>
            <textarea
              id="response"
              name="response"
              rows={4}
              value={formData.response}
              onChange={handleChange}
              placeholder="Enter the response template"
              className="input-field resize-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner /> : (editingIntent ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IntentManagement;