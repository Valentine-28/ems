import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, DollarSign, Download } from 'lucide-react';

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: '',
    overtime_pay: 0,
    allowances: 0,
    bonus: 0,
    deductions: 0,
    tax_deductions: 0,
    net_salary: '',
    payment_date: ''
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPayrolls();
    if (user.role === 'hr_manager' || user.role === 'admin') {
      fetchEmployees();
    }
  }, []);

  const fetchPayrolls = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/payroll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayrolls(response.data);
    } catch (error) {
      toast.error('Failed to fetch payroll records');
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

  useEffect(() => {
    if (formData.basic_salary) {
      calculateNetSalary();
    }
  }, [formData.basic_salary, formData.overtime_pay, formData.allowances, formData.bonus, formData.deductions, formData.tax_deductions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/payroll', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payroll record created successfully');
      setIsModalOpen(false);
      resetForm();
      fetchPayrolls();
    } catch (error) {
      toast.error('Failed to create payroll record');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      basic_salary: '',
      overtime_pay: 0,
      allowances: 0,
      bonus: 0,
      deductions: 0,
      tax_deductions: 0,
      net_salary: '',
      payment_date: ''
    });
  };

  const handleDownloadPayslip = (payroll) => {
    // Generate simple payslip text
    const payslip = `
      ========== PAYSLIP ==========
      Employee: ${payroll.full_name}
      Position: ${payroll.position}
      Payment Date: ${new Date(payroll.payment_date).toLocaleDateString()}
      
      Earnings:
      Basic Salary: $${payroll.basic_salary}
      Overtime Pay: $${payroll.overtime_pay || 0}
      Allowances: $${payroll.allowances || 0}
      Bonus: $${payroll.bonus || 0}
      
      Deductions:
      Deductions: $${payroll.deductions || 0}
      Tax: $${payroll.tax_deductions || 0}
      
      Net Salary: $${payroll.net_salary}
      ==============================
    `;
    
    const blob = new Blob([payslip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${payroll.full_name}_${payroll.payment_date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Payslip downloaded');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">薪资管理</h1>
        {(user.role === 'hr_manager' || user.role === 'admin') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            创建薪资记录
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">基本薪资</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">加班费</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">津贴</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">奖金</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">扣款</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">实发工资</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发放日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payrolls.map((payroll) => (
              <tr key={payroll.payroll_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payroll.full_name}</div>
                  <div className="text-sm text-gray-500">{payroll.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payroll.basic_salary}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payroll.overtime_pay || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payroll.allowances || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payroll.bonus || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payroll.deductions || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${payroll.net_salary}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(payroll.payment_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDownloadPayslip(payroll)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">创建薪资记录</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">基本薪资</label>
                  <input
                    type="number"
                    value={formData.basic_salary}
                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">加班费</label>
                  <input
                    type="number"
                    value={formData.overtime_pay}
                    onChange={(e) => setFormData({ ...formData, overtime_pay: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">津贴</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">奖金</label>
                  <input
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">扣款</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">个税</label>
                  <input
                    type="number"
                    value={formData.tax_deductions}
                    onChange={(e) => setFormData({ ...formData, tax_deductions: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">实发工资</label>
                  <input
                    type="text"
                    value={formData.net_salary}
                    className="input-field bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发放日期</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
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
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;