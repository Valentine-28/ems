import React, { useState, useEffect } from 'react';
import { performanceAPI, employeeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiStar, FiCalendar, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Performance = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    review_date: new Date().toISOString().split('T')[0],
    rating: 3,
    comments: '',
    goals: ''
  });
  const { user } = useAuth();

  const isHRorAdmin = user?.role === 'hr_manager' || user?.role === 'admin';

  useEffect(() => {
    fetchReviews();
    if (isHRorAdmin) {
      fetchEmployees();
    }
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await performanceAPI.getAll();
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to fetch performance reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await performanceAPI.create(formData);
      toast.success('Performance review added successfully');
      fetchReviews();
      handleCloseForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add review');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      employee_id: '',
      review_date: new Date().toISOString().split('T')[0],
      rating: 3,
      comments: '',
      goals: ''
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading performance reviews...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Reviews</h1>
          <p className="text-gray-600 mt-1">Track employee performance and feedback</p>
        </div>
        {isHRorAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
            <FiPlus size={18} />
            <span>Add Review</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div key={review.review_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isHRorAdmin ? review.employee_name : user?.username}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <FiCalendar className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-600">
                    {new Date(review.review_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Comments</p>
                <p className="text-sm text-gray-600">{review.comments || 'No comments provided'}</p>
              </div>
              
              {review.goals && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Goals & Objectives</p>
                  <p className="text-sm text-gray-600">{review.goals}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-2 pt-2 text-xs text-gray-500">
                <FiUser size={12} />
                <span>Reviewed by: {review.reviewer_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {reviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No performance reviews found</p>
        </div>
      )}
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Performance Review</h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Date *</label>
                <input
                  type="date"
                  required
                  value={formData.review_date}
                  onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <FiStar
                        className={`h-8 w-8 ${
                          star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  rows="3"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="input-field"
                  placeholder="Provide feedback on employee performance..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goals & Objectives</label>
                <textarea
                  rows="3"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  className="input-field"
                  placeholder="Set future goals and objectives..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={handleCloseForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;