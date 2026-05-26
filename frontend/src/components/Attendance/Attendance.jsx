import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const isHRorAdmin = user?.role === 'hr_manager' || user?.role === 'admin';

  useEffect(() => {
    checkTodayAttendance();
    if (isHRorAdmin) {
      fetchReport();
    }
  }, []);

  const checkTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await attendanceAPI.getReport({ 
        start_date: today, 
        end_date: today,
        employee_id: user.employee_id 
      });
      if (response.data.length > 0) {
        setTodayAttendance(response.data[0]);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await attendanceAPI.checkIn();
      toast.success('Checked in successfully!');
      setTodayAttendance(response.data);
      checkTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await attendanceAPI.checkOut();
      toast.success('Checked out successfully!');
      checkTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await attendanceAPI.getReport({ 
        start_date: startDate, 
        end_date: endDate 
      });
      setReportData(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance report');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-1">Track your daily attendance</p>
      </div>
      
      {/* Check-in/out Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleCheckIn}
            disabled={checkingIn || todayAttendance?.check_in}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              todayAttendance?.check_in
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <FiClock size={20} />
            <span>{checkingIn ? 'Checking in...' : 'Check In'}</span>
          </button>
          
          <button
            onClick={handleCheckOut}
            disabled={checkingOut || !todayAttendance?.check_in || todayAttendance?.check_out}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              !todayAttendance?.check_in || todayAttendance?.check_out
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <FiXCircle size={20} />
            <span>{checkingOut ? 'Checking out...' : 'Check Out'}</span>
          </button>
        </div>
        
        {todayAttendance && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Check In Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {todayAttendance.check_in || 'Not checked in'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check Out Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {todayAttendance.check_out || 'Not checked out'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Report Section - Only for HR/Admin */}
      {isHRorAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Report</h2>
          
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary">
                Generate Report
              </button>
            </div>
          </form>
          
          {loading ? (
            <div className="text-center py-8">Loading report...</div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No attendance records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((record) => (
                    <tr key={record.attendance_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.full_name}</div>
                          <div className="text-sm text-gray-500">{record.position}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.check_in || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.check_out || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.check_in && record.check_out ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiCheckCircle size={12} className="mr-1" />
                            Complete
                          </span>
                        ) : record.check_in ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FiClock size={12} className="mr-1" />
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FiXCircle size={12} className="mr-1" />
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;