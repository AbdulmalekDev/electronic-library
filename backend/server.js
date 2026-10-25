import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import connectDB from './config/database.js';
import app from './app.js';

// Connect to database
connectDB();

console.log("Mongo URI:", process.env.MONGODB_URI);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});