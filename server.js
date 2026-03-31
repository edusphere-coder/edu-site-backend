const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initializeDatabase, testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const presentationRoutes = require('./routes/presentations');
const recordingRoutes = require('./routes/recordings');
const enrollmentRoutes = require('./routes/enrollments');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// ✅ FIXED CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://edu-site-ftu8-gl98mnlbx-edusphere-coders-projects.vercel.app/"
    ],
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/presentations', presentationRoutes);
app.use('/api/recordings', recordingRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    console.log('Initializing database...');
    await initializeDatabase();

    console.log('Testing database connection...');
    const connected = await testConnection();

    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health Check: /health`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
