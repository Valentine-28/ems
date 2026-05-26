import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Star } from 'lucide-react';

function Performance() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    review_date: '',
    rating: 3,
    comments: '',
    goals: ''
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchReviews();
    if (user.role === 'hr_manager' || user.role === 'admin') {
      fetchEmployees();
    }
  }, []);

  const fetchReviews = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/performance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to fetch performance reviews');
    }
  };

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/performance', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Performance review added successfully');
      setIsModalOpen(false);
      resetForm();
      fetchReviews();
    } catch (error) {
      toast.error('Failed to add performance review');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      review_date: '',
      rating: 3,
      comments: '',
      goals: ''
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">绩效管理</h1>
        {(user.role === 'hr_manager' || user.role === 'admin') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            添加绩效评估
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.map((review) => (
          <div key={review.review_id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{review.employee_name || review.full_name}</h3>
                <p className="text-sm text-gray-500">评估人: {review.reviewer_name}</p>
                <p className="text-sm text-gray-500">评估日期: {new Date(review.review_date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm font-semibold">({review.rating}/5)</span>
              </div>
            </div>
            
            {review.comments && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">评估意见：</h4>
                <p className="text-gray-600">{review.comments}</p>
              </div>
            )}
            
            {review.goals && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">发展目标：</h4>
                <p className="text-gray-600">{review.goals}</p>
              </div>
            )}
          </div>
        ))}
        
        {reviews.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">暂无绩效评估记录</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">添加绩效评估</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">员工</label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">选择员工</option>
                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">评估日期</label>
                <input
                  type="date"
                  value={formData.review_date}
                  onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">评分 (1-5)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="input-field"
                >
                  <option value="1">1 - 极差</option>
                  <option value="2">2 - 较差</option>
                  <option value="3">3 - 一般</option>
                  <option value="4">4 - 良好</option>
                  <option value="5">5 - 优秀</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">评估意见</label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">发展目标</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  添加评估
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Performance;