const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// In-memory data store
const users = [
  {
    id: '1',
    email: 'admin@test.com',
    fullName: 'System Administrator',
    role: 'ADMIN',
    status: 'ACTIVE',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwwK7x0xr/YdS/G', // Test123!
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'engineer@test.com',
    fullName: 'John Engineer',
    role: 'ENGINEER',
    status: 'ACTIVE',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwwK7x0xr/YdS/G', // Test123!
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'tm@test.com',
    fullName: 'Technical Manager',
    role: 'TECHNICAL_MANAGER',
    status: 'ACTIVE',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwwK7x0xr/YdS/G', // Test123!
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    email: 'pm@test.com',
    fullName: 'Project Manager',
    role: 'PROJECT_MANAGER',
    status: 'ACTIVE',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwwK7x0xr/YdS/G', // Test123!
    createdAt: new Date().toISOString()
  }
];

const reports = [
  {
    id: '1',
    title: 'Sample SAT Report - Control System Validation',
    projectRef: 'PRJ-2025-001',
    documentRef: 'SAT-001',
    revision: '1.0',
    type: 'SAT',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: null,
    completedAt: null,
    creatorId: '2',
    tmId: '3',
    pmId: '4',
    creator: {
      id: '2',
      fullName: 'John Engineer',
      email: 'engineer@test.com'
    },
    technicalManager: {
      id: '3',
      fullName: 'Technical Manager',
      email: 'tm@test.com'
    },
    projectManager: {
      id: '4',
      fullName: 'Project Manager',
      email: 'pm@test.com'
    },
    steps: [],
    signatures: [],
    comments: [],
    files: [],
    _count: {
      comments: 0,
      files: 0
    }
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Access token required' }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0' 
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, fullName, role } = req.body;

    if (!email || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email, fullName, and role are required' }
      });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already exists' }
      });
    }

    const tempPassword = 'temp123';
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = {
      id: (users.length + 1).toString(),
      email,
      fullName,
      role,
      status: 'PENDING',
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    res.status(201).json({
      success: true,
      data: { 
        message: 'Registration successful! Account pending approval.',
        user: { ...user, password: undefined } 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed' }
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' }
      });
    }

    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { message: 'Account is not active. Please contact an administrator.' }
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    user.lastLogin = new Date().toISOString();

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' }
    });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { user: req.user }
  });
});

app.post('/api/auth/refresh', authenticateToken, (req, res) => {
  const token = jwt.sign(
    { userId: req.user.id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    data: { token, user: req.user }
  });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});

// Reports routes
app.get('/api/reports', authenticateToken, (req, res) => {
  try {
    let filteredReports = [...reports];

    // Filter by user role
    if (req.user.role === 'ENGINEER') {
      filteredReports = reports.filter(r => r.creatorId === req.user.id);
    } else if (req.user.role === 'TECHNICAL_MANAGER') {
      filteredReports = reports.filter(r => r.tmId === req.user.id);
    } else if (req.user.role === 'PROJECT_MANAGER') {
      filteredReports = reports.filter(r => r.pmId === req.user.id);
    }

    res.json({
      success: true,
      data: { reports: filteredReports }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch reports' }
    });
  }
});

app.get('/api/reports/:id', authenticateToken, (req, res) => {
  try {
    const report = reports.find(r => r.id === req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { message: 'Report not found' }
      });
    }

    // Check access permissions
    if (req.user.role !== 'ADMIN' && 
        report.creatorId !== req.user.id && 
        report.tmId !== req.user.id && 
        report.pmId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch report' }
    });
  }
});

app.post('/api/reports', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'ENGINEER') {
      return res.status(403).json({
        success: false,
        error: { message: 'Only engineers can create reports' }
      });
    }

    const { title, projectRef, documentRef, revision, tmId, pmId } = req.body;

    if (!title || !projectRef || !documentRef || !revision) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title, projectRef, documentRef, and revision are required' }
      });
    }

    const newReport = {
      id: (reports.length + 1).toString(),
      title,
      projectRef,
      documentRef,
      revision,
      type: 'SAT',
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: null,
      completedAt: null,
      creatorId: req.user.id,
      tmId: tmId || null,
      pmId: pmId || null,
      creator: req.user,
      technicalManager: tmId ? users.find(u => u.id === tmId) : null,
      projectManager: pmId ? users.find(u => u.id === pmId) : null,
      steps: [],
      signatures: [],
      comments: [],
      files: [],
      _count: {
        comments: 0,
        files: 0
      }
    };

    reports.push(newReport);

    res.status(201).json({
      success: true,
      data: newReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create report' }
    });
  }
});

// Users routes
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required' }
      });
    }

    const safeUsers = users.map(user => ({
      ...user,
      password: undefined,
      _count: {
        createdReports: reports.filter(r => r.creatorId === user.id).length,
        tmAssignedReports: reports.filter(r => r.tmId === user.id).length,
        pmAssignedReports: reports.filter(r => r.pmId === user.id).length
      }
    }));

    res.json({
      success: true,
      data: safeUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch users' }
    });
  }
});

app.get('/api/users/by-role/:role', authenticateToken, (req, res) => {
  try {
    const role = req.params.role;
    const roleUsers = users
      .filter(user => user.role === role && user.status === 'ACTIVE')
      .map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }));

    res.json(roleUsers);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch users by role' }
    });
  }
});

// Files routes
app.post('/api/files/upload', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      files: [{
        id: 'mock-file-id',
        filename: 'mock-file.jpg',
        originalName: 'screenshot.jpg',
        size: 12345
      }]
    }
  });
});

// Audit routes
app.get('/api/audit', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required' }
      });
    }

    res.json({
      success: true,
      data: {
        logs: [],
        pagination: { total: 0, pages: 0, page: 1, limit: 50 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch audit logs' }
    });
  }
});

app.get('/api/audit/stats', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required' }
      });
    }

    res.json({
      success: true,
      data: {
        actionCounts: [{ action: 'login', _count: { action: 10 } }],
        topUsers: users.slice(0, 4)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch audit stats' }
    });
  }
});

// Settings routes
app.get('/api/settings', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required' }
      });
    }

    res.json({
      success: true,
      data: {
        company_info: {
          name: 'Cully Engineering',
          logo: 'https://media.licdn.com/dms/image/v2/D4E0BAQG6jwfpjfwUzg/company-logo_200_200/B4EZWobGDBGgAI-/0/1742287430793?e=2147483647&v=beta&t=e6YGBC6xfBx0K_HdayHU14DXg5VrzixUtB4AuvZBM24',
          primaryColor: '#3B82F6'
        },
        final_storage_locations: [
          '/storage/completed/project-a',
          '/storage/completed/project-b',
          '/storage/archive/2025'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch settings' }
    });
  }
});

app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Settings updated successfully' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update settings' }
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal Server Error' }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cully Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('🔑 Demo users:');
  console.log('  • admin@test.com / Test123! (Admin)');
  console.log('  • engineer@test.com / Test123! (Engineer)');
  console.log('  • tm@test.com / Test123! (Technical Manager)');
  console.log('  • pm@test.com / Test123! (Project Manager)');
});