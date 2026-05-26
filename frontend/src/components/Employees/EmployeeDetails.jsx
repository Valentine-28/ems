import React from 'react';
import { FiX, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiDollarSign, FiUser } from 'react-icons/fi';

const EmployeeDetails = ({ employee, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            {employee.profile_photo ? (
              <img 
                src={`http://localhost:5000/${employee.profile_photo}`} 
                alt={employee.full_name}
                className="h-24 w-24 rounded-full object-cover border-4 border-primary-100"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-100">
                <span className="text-primary-600 text-3xl font-bold">
                  {employee.full_name?.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{employee.full_name}</h3>
              <p className="text-gray-600">{employee.position}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                Active
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiMail className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{employee.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiPhone className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-900">{employee.phone || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiUser className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{employee.gender || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiCalendar className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900">
                  {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiBriefcase className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-medium text-gray-900">{employee.department_name || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiCalendar className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Joining Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FiDollarSign className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Salary</p>
                <p className="text-sm font-medium text-gray-900">
                  ${employee.salary ? parseFloat(employee.salary).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <FiMapPin className="text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-900">{employee.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;