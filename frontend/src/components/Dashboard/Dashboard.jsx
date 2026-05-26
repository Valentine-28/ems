import React, { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI, leaveAPI, payrollAPI } from '../../services/api';
import { FiUsers, FiClock, FiCalendar, FiDollarSign, FiTrendingUp, FiBriefcase } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    totalPayroll: 0
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, attendanceRes, leavesRes, payrollRes] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getReport({ start_date: new Date().toISOString().split('T')[0], end_date: new Date().toISOString().split('T')[0] }),
        leaveAPI.getAll(),
        payrollAPI.getAll()
      ]);

      setStats({
        totalEmployees: employeesRes.data.length,
        presentToday: attendanceRes.data.length,
        pendingLeaves: leavesRes.data.filter(l => l.status === 'pending').length,
        totalPayroll: payrollRes.data.reduce((sum, p) => sum + parseFloat(p.net_salary), 0)
      });
      setRecentEmployees(employeesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: FiUsers, color: 'bg-blue-500' },
    { title: 'Present Today', value: stats.presentToday, icon: FiClock, color: 'bg-green-500' },
    { title: 'Pending Leaves', value: stats.pendingLeaves, icon: FiCalendar, color: 'bg-yellow-500' },
    { title: 'Total Payroll', value: `$${stats.totalPayroll.toLocaleString()}`, icon: FiDollarSign, color: 'bg-purple-500' },
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Employees',
        data: [65, 70, 75, 80, 85, stats.totalEmployees],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Employee Growth',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back to HR Management System</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Line data={chartData} options={options} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Employees</h3>
          <div className="space-y-3">
            {recentEmployees.map((employee) => (
              <div key={employee.employee_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{employee.full_name}</p>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                </div>
                <div className="text-sm text-gray-500">{employee.department_name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;