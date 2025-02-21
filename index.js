const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import the database connection function
const setupAdmin = require('./config/setupAdmin'); // Import the admin setup function
const authRoutes = require('./routes/authUserRoute');
 
const propertyRoutes = require('./routes/propertyRoute');

// const dotenv = require('dotenv');
 
 
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Re-enabled CORS
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
 
app.use('/api/property', propertyRoutes);
app.use('/api/admin',require('./routes/adminRoute') );

const path = require('path');

// Serve static files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Start the server and initialize admin account
const PORT =   3000 ; // Fallback port added

const startServer = async () => {
  try {
    console.log(`http://localhost:${PORT}`);

    // Set up the default admin account
    await setupAdmin();

    // Start the server
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error('❌ Failed to start the server:', error.message);
    process.exit(1); // Exit the process if there's an error
  }
};

app.get('/', (req, res) => {
  res.send(" Hello World!");
});

startServer();
