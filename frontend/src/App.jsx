import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import EmployeeList from './components/Employees/EmployeeList';
import EmployeeForm from './components/Employees/EmployeeForm';
import EmployeeDetails from './components/Employees/EmployeeDetails';
import DepartmentList from './components/Departments/DepartmentList';
import Attendance from './components/Attendance/Attendance';
import LeaveRequests from './components/Leaves/LeaveRequests';
import Payroll from './components/Payroll/Payroll';
import Performance from './components/Performance/Performance';
import Reports from './components/Reports/Reports';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEmployeeSuccess = () => {
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute>
            <Layout>
              <EmployeeList 
                key={refreshTrigger}
                onEdit={(emp) => {
                  setSelectedEmployee(emp);
                  setShowEmployeeForm(true);
                }}
                onView={(emp) => setViewingEmployee(emp)}
              />
              {showEmployeeForm && (
                <EmployeeForm
                  employee={selectedEmployee}
                  onClose={() => {
                    setShowEmployeeForm(false);
                    setSelectedEmployee(null);
                  }}
                  onSuccess={handleEmployeeSuccess}
                />
              )}
              {viewingEmployee && (
                <EmployeeDetails
                  employee={viewingEmployee}
                  onClose={() => setViewingEmployee(null)}
                />
              )}
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/departments" element={
          <ProtectedRoute>
            <Layout>
              <DepartmentList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute>
            <Layout>
              <Attendance />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/leaves" element={
          <ProtectedRoute>
            <Layout>
              <LeaveRequests />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/payroll" element={
          <ProtectedRoute>
            <Layout>
              <Payroll />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/performance" element={
          <ProtectedRoute>
            <Layout>
              <Performance />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;