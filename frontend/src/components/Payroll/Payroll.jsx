import React, { useState, useEffect } from 'react';
import { payrollAPI, employeeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus, FiDollarSign, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: '',
    overtime_pay: 0,
    allowances: 0,
    bonus: 0,
    deductions: 0,
    tax_deductions: 0,
    net_salary: '',
    payment_date: new Date().toISOString().split('T')[0]
  });
  const { user } = useAuth();

  const isHRorAdmin = user?.role === 'hr_manager' || user?.role === 'admin';

  useEffect(() => {
    fetchPayrolls();
    if (isHRorAdmin) {
      fetchEmployees();
    }
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await payrollAPI.getAll();
      setPayrolls(response.data);
    } catch (error) {
      toast.error('Failed to fetch payroll records');
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

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const overtime = parseFloat(formData.overtime_pay) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const tax = parseFloat(formData.tax_deductions) || 0;
    
    const net = basic + overtime + allowances + bonus - deductions - tax;
    setFormData({ ...formData, net_salary: net.toFixed(2) });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (['basic_salary', 'overtime_pay', 'allowances', 'bonus', 'deductions', 'tax_deductions'].includes(name)) {
      setTimeout(calculateNetSalary, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await payrollAPI.create(formData);
      toast.success('Payroll record created successfully');
      fetchPayrolls();
      handleCloseForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payroll');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      employee_id: '',
      basic_salary: '',
      overtime_pay: 0,
      allowances: 0,
      bonus: 0,
      deductions: 0,
      tax_deductions: 0,
      net_salary: '',
      payment_date: new Date().toISOString().split('T')[0]
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading payroll records...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Manage employee salaries and payments</p>
        </div>
        {isHRorAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
            <FiPlus size={18} />
            <span>Create Payroll</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Payroll</p>
              <p className="text-2xl font-bold mt-2">
                ${payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary), 0).toLocaleString()}
              </p>
            </div>
            <FiDollarSign size={32} className="text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Average Salary</p>
              <p className="text-2xl font-bold mt-2">
                ${payrolls.length > 0 ? (payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary), 0) / payrolls.length).toFixed(2) : 0}
              </p>
            </div>
            <FiDollarSign size={32} className="text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">This Month</p>
              <p className="text-2xl font-bold mt-2">
                ${payrolls.filter(p => new Date(p.payment_date).getMonth() === new Date().getMonth())
                  .reduce((sum, p) => sum + parseFloat(p.net_salary), 0).toLocaleString()}
              </p>
            </div>
            <FiCalendar size={32} className="text-purple-200" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.map((payroll) => (
                <tr key={payroll.payroll_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payroll.full_name}</div>
                      <div className="text-sm text-gray-500">{payroll.position}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${parseFloat(payroll.basic_salary).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${parseFloat(payroll.allowances || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${parseFloat(payroll.deductions || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">
                      ${parseFloat(payroll.net_salary).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(payroll.payment_date).toLocaleDateString()}
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create Payroll Record</h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                <select
                  name="employee_id"
                  required
                  value={formData.employee_id}
                  onChange={handleInputChange}
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary *</label>
                  <input
                    type="number"
                    name="basic_salary"
                    required
                    value={formData.basic_salary}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overtime Pay</label>
                  <input
                    type="number"
                    name="overtime_pay"
                    value={formData.overtime_pay}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allowances</label>
                  <input
                    type="number"
                    name="allowances"
                    value={formData.allowances}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
                  <input
                    type="number"
                    name="bonus"
                    value={formData.bonus}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Deductions</label>
                  <input
                    type="number"
                    name="tax_deductions"
                    value={formData.tax_deductions}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Net Salary</label>
                <input
                  type="text"
                  value={formData.net_salary}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  name="payment_date"
                  required
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={handleCloseForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;