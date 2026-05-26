import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role === 'hr_manager' || user.role === 'admin') {
      fetchEmployees();
      fetchAttendanceReport();
    }
  }, []);

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

  const fetchAttendanceReport = async () => {
    const token = localStorage.getItem('token');
    try {
      let url = '/api/attendance/report';
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (selectedEmployee) params.append('employee_id', selectedEmployee);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance report');
    }
  };

  const handleCheckIn = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/attendance/checkin', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Checked in successfully');
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put('/api/attendance/checkout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Checked out successfully');
    } catch (error) {
      toast.error('Failed to check out');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Present':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">正常</span>;
      case 'Late':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">迟到</span>;
      default:
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">缺勤</span>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">考勤管理</h1>
      
      {user.role === 'employee' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">今日打卡</h2>
          <div className="flex gap-4">
            <button onClick={handleCheckIn} className="btn-primary flex items-center gap-2">
              <Clock size={20} />
              上班打卡
            </button>
            <button onClick={handleCheckOut} className="btn-secondary flex items-center gap-2">
              <Clock size={20} />
              下班打卡
            </button>
          </div>
        </div>
      )}

      {(user.role === 'hr_manager' || user.role === 'admin') && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">考勤报表</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">员工</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="input-field"
              >
                <option value="">所有员工</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={fetchAttendanceReport} className="btn-primary">
            生成报表
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上班时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下班时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((record) => (
              <tr key={record.attendance_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.full_name}</div>
                  <div className="text-sm text-gray-500">{record.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.check_in}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.check_out || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;