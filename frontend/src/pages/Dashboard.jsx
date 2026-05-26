import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Building2, CalendarCheck, DollarSign } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    leaves: 0,
    payrolls: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const [employees, departments, leaves, payrolls] = await Promise.all([
        axios.get('/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/departments', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/leaves', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/payroll', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setStats({
        employees: employees.data.length,
        departments: departments.data.length,
        leaves: leaves.data.filter(l => l.status === 'Pending').length,
        payrolls: payrolls.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { title: '员工总数', value: stats.employees, icon: Users, color: 'bg-blue-500' },
    { title: '部门总数', value: stats.departments, icon: Building2, color: 'bg-green-500' },
    { title: '待批请假', value: stats.leaves, icon: CalendarCheck, color: 'bg-yellow-500' },
    { title: '薪资记录', value: stats.payrolls, icon: DollarSign, color: 'bg-purple-500' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">仪表板</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;