const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret_key_change_this';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if not exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hr_management_system'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Role-based authorization middleware
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

// ============= AUTHENTICATION ROUTES =============

// Register
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, role, employee_id } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password, role, employee_id) VALUES (?, ?, ?, ?, ?)';
        
        db.query(query, [username, email, hashedPassword, role || 'employee', employee_id || null], (err, result) => {
            if (err) {
                return res.status(400).json({ message: 'User registration failed', error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    });
});

// ============= EMPLOYEE MANAGEMENT ROUTES =============

// Get all employees
app.get('/api/employees', authenticateToken, (req, res) => {
    const query = `
        SELECT e.*, d.department_name 
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.department_id
        ORDER BY e.employee_id DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(results);
    });
});

// Get employee by ID
app.get('/api/employees/:id', authenticateToken, (req, res) => {
    const query = `
        SELECT e.*, d.department_name 
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.department_id
        WHERE e.employee_id = ?
    `;
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(results[0]);
    });
});

// Add new employee
app.post('/api/employees', authenticateToken, authorizeRoles('hr_manager', 'admin'), upload.single('profile_photo'), (req, res) => {
    const { full_name, gender, date_of_birth, email, phone, address, position, department_id, salary, joining_date } = req.body;
    const profile_photo = req.file ? req.file.path : null;
    
    const query = `
        INSERT INTO employees (full_name, gender, date_of_birth, email, phone, address, position, department_id, salary, joining_date, profile_photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [full_name, gender, date_of_birth, email, phone, address, position, department_id, salary, joining_date, profile_photo], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to add employee', error: err.message });
        }
        res.status(201).json({ message: 'Employee added successfully', employee_id: result.insertId });
    });
});

// Update employee
app.put('/api/employees/:id', authenticateToken, authorizeRoles('hr_manager', 'admin'), upload.single('profile_photo'), (req, res) => {
    const { full_name, gender, date_of_birth, email, phone, address, position, department_id, salary, joining_date } = req.body;
    let query = `
        UPDATE employees 
        SET full_name = ?, gender = ?, date_of_birth = ?, email = ?, phone = ?, 
            address = ?, position = ?, department_id = ?, salary = ?, joining_date = ?
    `;
    let params = [full_name, gender, date_of_birth, email, phone, address, position, department_id, salary, joining_date];
    
    if (req.file) {
        query += ', profile_photo = ?';
        params.push(req.file.path);
    }
    
    query += ' WHERE employee_id = ?';
    params.push(req.params.id);
    
    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to update employee', error: err.message });
        }
        res.json({ message: 'Employee updated successfully' });
    });
});

// Delete employee
app.delete('/api/employees/:id', authenticateToken, authorizeRoles('hr_manager', 'admin'), (req, res) => {
    const query = 'DELETE FROM employees WHERE employee_id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete employee', error: err.message });
        }
        res.json({ message: 'Employee deleted successfully' });
    });
});

// Search employees
app.get('/api/employees/search/:term', authenticateToken, (req, res) => {
    const searchTerm = `%${req.params.term}%`;
    const query = `
        SELECT e.*, d.department_name 
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.department_id
        WHERE e.full_name LIKE ? OR e.email LIKE ? OR e.position LIKE ?
    `;
    
    db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(results);
    });
});

// ============= DEPARTMENT MANAGEMENT ROUTES =============

// Get all departments
app.get('/api/departments', authenticateToken, (req, res) => {
    db.query('SELECT * FROM departments ORDER BY department_id', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(results);
    });
});

// Add department
app.post('/api/departments', authenticateToken, authorizeRoles('hr_manager', 'admin'), (req, res) => {
    const { department_name, description } = req.body;
    const query = 'INSERT INTO departments (department_name, description) VALUES (?, ?)';
    
    db.query(query, [department_name, description], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to add department', error: err.message });
        }
        res.status(201).json({ message: 'Department added successfully', department_id: result.insertId });
    });
});

// Update department
app.put('/api/departments/:id', authenticateToken, authorizeRoles('hr_manager', 'admin'), (req, res) => {
    const { department_name, description } = req.body;
    const query = 'UPDATE departments SET department_name = ?, description = ? WHERE department_id = ?';
    
    db.query(query, [department_name, description, req.params.id], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to update department', error: err.message });
        }
        res.json({ message: 'Department updated successfully' });
    });
});

// Delete department
app.delete('/api/departments/:id', authenticateToken, authorizeRoles('hr_manager', 'admin'), (req, res) => {
    const query = 'DELETE FROM departments WHERE department_id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete department', error: err.message });
        }
        res.json({ message: 'Department deleted successfully' });
    });
});

// ============= ATTENDANCE MANAGEMENT ROUTES =============

// Check in
app.post('/api/attendance/checkin', authenticateToken, (req, res) => {
    const employee_id = req.user.employee_id;
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = new Date().toTimeString().split(' ')[0];
    
    const query = 'INSERT INTO attendance (employee_id, check_in, date) VALUES (?, ?, ?)';
    
    db.query(query, [employee_id, checkInTime, today], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to check in', error: err.message });
        }
        res.json({ message: 'Checked in successfully', attendance_id: result.insertId });
    });
});

// Check out
app.put('/api/attendance/checkout', authenticateToken, (req, res) => {
    const employee_id = req.user.employee_id;
    const today = new Date().toISOString().split('T')[0];
    const checkOutTime = new Date().toTimeString().split(' ')[0];
    
    const query = 'UPDATE attendance SET check_out = ? WHERE employee_id = ? AND date = ?';
    
    db.query(query, [checkOutTime, employee_id, today], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to check out', error: err.message });
        }
        res.json({ message: 'Checked out successfully' });
    });
});

// Get attendance report
app.get('/api/attendance/report', authenticateToken, authorizeRoles('hr_manager', 'admin'), (req, res) => {
    const { start_date, end_date, employee_id } = req.query;
    let query = `
        SELECT a.*, e.full_name, e.position 
        FROM attendance a
        JOIN employees e ON a.employee_id = e.employee_id
        WHERE a.date BETWEEN ? AND ?
    `;
    let params = [start_date, end_date];
    
    if (employee_id) {
        query += ' AND a.employee_id = ?';
        params.push(employee_id);
    }
    
    query += ' ORDER BY a.date DESC';
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(results);
    });
});

// ============= LEAVE MANAGEMENT ROUTES =============

// Apply for leave
app.post('/api/leaves', authenticateToken, (req, res) => {
    const { leave_type, start_date, end_date, reason } = req.body;
    const employee_id = req.user.employee_id;
    
    const query = 'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [employee_id, leave_type, start_date, end_date, reason], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to apply for leave', error: err.message });
        }
        res.status(201).json({ message: 'Leave request submitted successfully', leave_id: result.insertId });
    });
});

// Get leave requests (HR sees all, employee sees own)
app.get('/api/leaves', authenticateToken, (req, res) => {
    let query;
    let params;
    
    if (req.user.role === 'hr_manager' || req.user.role === 'admin') {
        query = `
            SELECT l.*, e.full_name, e.position 
            FROM leave_requests l
            JOIN employees e ON l.employee_id = e.employee_id
            ORDER BY l.created_at DESC
        `;
        params = [];
    } else {
        query = `
            SELECT * FROM leave_requests 
            WHERE employee_id = ? 
            ORDER BY created_at DESC
        `;
        params = [req.user.employee_id];
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(results);
    });
});

// Approve/reject leave
app.put('/api/leaves/:id/status', authenticateToken, authorizeRoles('hr_manager', 'admin'), (req, res) => {
    const { status, comments } = req.body;
    const query = 'UPDATE leave_requests SET status = ?, comments = ?, approved_by = ? WHERE leave_id = ?';
    
    db.query(query, [status, comments, req.user.id, req.params.id], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to update leave status', error: err.message });
        }
        res.json({ message: 'Leave request updated successfully' });
    });
});

// ============= PAYROLL MANAGEMENT ROUTES =============

// Create payroll
app.post('/api/payroll', authenticateToken, authorizeRoles('hr_manager', 'admin'), (req, res) => {
    const { employee_id, basic_salary, overtime_pay, allowances, bonus, deductions, tax_deductions, net_salary, payment_date } = req.body;
    
    const query = `
        INSERT INTO payroll (employee_id, basic_salary, overtime_pay, allowances, bonus, deductions, tax_deductions, net_salary, payment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [employee_id, basic_salary, overtime_pay, allowances, bonus, deductions, tax_deductions, net_salary, payment_date], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to create payroll', error: err.message });
        }
        res.status(201).json({ message: 'Payroll created successfully', payroll_id: result.insertId });
    });
});

// Get payroll records
app.get('/api/payroll', authenticateToken, (req, res) => {
    let query;
    let params;
    
    if (req.user.role === 'hr_manager' || req.user.role === 'admin') {
        query = `
            SELECT p.*, e.full_name, e.position 
            FROM payroll p
            JOIN employees e ON p.employee_id = e.employee_id
            ORDER BY p.payment_date DESC
        `;
        params = [];
    } else {
        query = `
            SELECT p.*, e.full_name, e.position 
            FROM payroll p
            JOIN employees e ON p.employee_id = e.employee_id
            WHERE p.employee_id = ?
            ORDER BY p.payment_date DESC
        `;
        params = [req.user.employee_id];
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(results);
    });
});

// ============= PERFORMANCE MANAGEMENT ROUTES =============

// Add performance review
app.post('/api/performance', authenticateToken, authorizeRoles('hr_manager', 'admin'), (req, res) => {
    const { employee_id, review_date, rating, comments, goals } = req.body;
    const reviewer_id = req.user.id;
    
    const query = 'INSERT INTO performance_reviews (employee_id, reviewer_id, review_date, rating, comments, goals) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [employee_id, reviewer_id, review_date, rating, comments, goals], (err, result) => {
        if (err) {
            return res.status(400).json({ message: 'Failed to add performance review', error: err.message });
        }
        res.status(201).json({ message: 'Performance review added successfully', review_id: result.insertId });
    });
});

// Get performance reviews
app.get('/api/performance', authenticateToken, (req, res) => {
    let query;
    let params;
    
    if (req.user.role === 'hr_manager' || req.user.role === 'admin') {
        query = `
            SELECT pr.*, e.full_name as employee_name, u.username as reviewer_name
            FROM performance_reviews pr
            JOIN employees e ON pr.employee_id = e.employee_id
            JOIN users u ON pr.reviewer_id = u.id
            ORDER BY pr.review_date DESC
        `;
        params = [];
    } else {
        query = `
            SELECT pr.*, u.username as reviewer_name
            FROM performance_reviews pr
            JOIN users u ON pr.reviewer_id = u.id
            WHERE pr.employee_id = ?
            ORDER BY pr.review_date DESC
        `;
        params = [req.user.employee_id];
    }
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        res.json(results);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});