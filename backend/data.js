const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Database configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Change this to your MySQL password
    database: 'hr_management_system'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database successfully!');
    insertDemoData();
});

// Hash password function
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Insert demo data
const insertDemoData = async () => {
    try {
        // Demo Users
        const users = [
            {
                username: 'admin',
                email: 'admin@example.com',
                password: await hashPassword('admin123'),
                role: 'admin',
                employee_id: null
            },
            {
                username: 'hr_manager',
                email: 'hr@example.com',
                password: await hashPassword('hr123'),
                role: 'hr_manager',
                employee_id: null
            },
            {
                username: 'john_employee',
                email: 'employee@example.com',
                password: await hashPassword('employee123'),
                role: 'employee',
                employee_id: 1 // This will be updated after employee is created
            }
        ];

        // First, clear existing data (optional)
        await clearExistingData();

        // Insert Departments
        const departments = [
            { department_name: 'Engineering', description: 'Software development and engineering department' },
            { department_name: 'Human Resources', description: 'HR and personnel management' },
            { department_name: 'Marketing', description: 'Marketing and communications' },
            { department_name: 'Sales', description: 'Sales and business development' },
            { department_name: 'Finance', description: 'Financial management and accounting' }
        ];

        for (const dept of departments) {
            await insertDepartment(dept);
        }
        console.log('✓ Departments inserted');

        // Insert Employees
        const employees = [
            {
                full_name: 'John Doe',
                gender: 'male',
                date_of_birth: '1990-05-15',
                email: 'employee@example.com',
                phone: '+1234567890',
                address: '123 Main St, City, Country',
                position: 'Software Engineer',
                department_id: 1, // Engineering
                salary: 75000.00,
                joining_date: '2023-01-15',
                profile_photo: null
            },
            {
                full_name: 'Jane Smith',
                gender: 'female',
                date_of_birth: '1988-08-20',
                email: 'jane.smith@example.com',
                phone: '+1234567891',
                address: '456 Oak Ave, City, Country',
                position: 'HR Manager',
                department_id: 2, // HR
                salary: 85000.00,
                joining_date: '2022-06-01',
                profile_photo: null
            },
            {
                full_name: 'Mike Johnson',
                gender: 'male',
                date_of_birth: '1992-03-10',
                email: 'mike.johnson@example.com',
                phone: '+1234567892',
                address: '789 Pine Rd, City, Country',
                position: 'Marketing Specialist',
                department_id: 3, // Marketing
                salary: 65000.00,
                joining_date: '2023-03-20',
                profile_photo: null
            },
            {
                full_name: 'Sarah Williams',
                gender: 'female',
                date_of_birth: '1991-11-25',
                email: 'sarah.williams@example.com',
                phone: '+1234567893',
                address: '321 Elm St, City, Country',
                position: 'Sales Manager',
                department_id: 4, // Sales
                salary: 90000.00,
                joining_date: '2022-09-10',
                profile_photo: null
            },
            {
                full_name: 'Robert Brown',
                gender: 'male',
                date_of_birth: '1985-07-30',
                email: 'robert.brown@example.com',
                phone: '+1234567894',
                address: '654 Maple Dr, City, Country',
                position: 'Finance Analyst',
                department_id: 5, // Finance
                salary: 70000.00,
                joining_date: '2023-02-05',
                profile_photo: null
            }
        ];

        const insertedEmployees = [];
        for (const emp of employees) {
            const result = await insertEmployee(emp);
            insertedEmployees.push({ id: result.insertId, email: emp.email });
        }
        console.log('✓ Employees inserted');

        // Update employee_id for the employee user
        const employeeUser = users.find(u => u.email === 'employee@example.com');
        if (employeeUser && insertedEmployees[0]) {
            employeeUser.employee_id = insertedEmployees[0].id;
        }

        // Insert Users
        for (const user of users) {
            await insertUser(user);
        }
        console.log('✓ Users inserted');

        // Insert some leave requests
        const leaveRequests = [
            {
                employee_id: insertedEmployees[0].id,
                leave_type: 'annual',
                start_date: '2024-01-10',
                end_date: '2024-01-15',
                reason: 'Family vacation',
                status: 'approved',
                comments: 'Approved',
                created_at: new Date()
            },
            {
                employee_id: insertedEmployees[1].id,
                leave_type: 'sick',
                start_date: '2024-01-05',
                end_date: '2024-01-06',
                reason: 'Flu',
                status: 'approved',
                comments: 'Get well soon',
                created_at: new Date()
            },
            {
                employee_id: insertedEmployees[2].id,
                leave_type: 'personal',
                start_date: '2024-01-20',
                end_date: '2024-01-22',
                reason: 'Personal matters',
                status: 'pending',
                comments: null,
                created_at: new Date()
            }
        ];

        for (const leave of leaveRequests) {
            await insertLeaveRequest(leave);
        }
        console.log('✓ Leave requests inserted');

        // Insert attendance records for today
        const today = new Date().toISOString().split('T')[0];
        const attendanceRecords = [
            {
                employee_id: insertedEmployees[0].id,
                check_in: '09:00:00',
                check_out: '17:30:00',
                date: today
            },
            {
                employee_id: insertedEmployees[1].id,
                check_in: '08:45:00',
                check_out: '17:15:00',
                date: today
            },
            {
                employee_id: insertedEmployees[2].id,
                check_in: '09:15:00',
                check_out: '18:00:00',
                date: today
            }
        ];

        for (const attendance of attendanceRecords) {
            await insertAttendance(attendance);
        }
        console.log('✓ Attendance records inserted');

        console.log('\n🎉 All demo data inserted successfully!\n');
        console.log('📝 Demo Login Credentials:');
        console.log('=================================');
        console.log('Admin:');
        console.log('  Email: admin@example.com');
        console.log('  Password: admin123');
        console.log('  Role: Admin');
        console.log('---------------------------------');
        console.log('HR Manager:');
        console.log('  Email: hr@example.com');
        console.log('  Password: hr123');
        console.log('  Role: HR Manager');
        console.log('---------------------------------');
        console.log('Employee:');
        console.log('  Email: employee@example.com');
        console.log('  Password: employee123');
        console.log('  Role: Employee');
        console.log('=================================\n');

        process.exit(0);

    } catch (error) {
        console.error('Error inserting demo data:', error);
        process.exit(1);
    }
};

// Helper functions
const clearExistingData = () => {
    return new Promise((resolve, reject) => {
        const tables = ['attendance', 'leave_requests', 'performance_reviews', 'payroll', 'users', 'employees', 'departments'];
        let completed = 0;
        
        if (tables.length === 0) {
            resolve();
            return;
        }
        
        tables.forEach(table => {
            db.query(`DELETE FROM ${table}`, (err) => {
                if (err && err.code !== 'ER_NO_SUCH_TABLE') {
                    console.log(`Note: Table ${table} may not exist yet`);
                }
                completed++;
                if (completed === tables.length) {
                    // Reset auto-increment
                    tables.forEach(t => {
                        db.query(`ALTER TABLE ${t} AUTO_INCREMENT = 1`, () => {});
                    });
                    resolve();
                }
            });
        });
    });
};

const insertDepartment = (department) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO departments (department_name, description) VALUES (?, ?)';
        db.query(query, [department.department_name, department.description], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const insertEmployee = (employee) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO employees (full_name, gender, date_of_birth, email, phone, address, position, department_id, salary, joining_date, profile_photo) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [
            employee.full_name, employee.gender, employee.date_of_birth, 
            employee.email, employee.phone, employee.address, employee.position, 
            employee.department_id, employee.salary, employee.joining_date, 
            employee.profile_photo
        ], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const insertUser = (user) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO users (username, email, password, role, employee_id) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [user.username, user.email, user.password, user.role, user.employee_id], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const insertLeaveRequest = (leave) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [leave.employee_id, leave.leave_type, leave.start_date, leave.end_date, leave.reason, leave.status, leave.comments, leave.created_at], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const insertAttendance = (attendance) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO attendance (employee_id, check_in, check_out, date) VALUES (?, ?, ?, ?)';
        db.query(query, [attendance.employee_id, attendance.check_in, attendance.check_out, attendance.date], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};