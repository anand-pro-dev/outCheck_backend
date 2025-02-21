const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Configure dotenv to load environment variables
dotenv.config();


const connectDB = async () => {
    try {
    

        const conn = await mongoose.connect(process.env.MONGO_URL);

        // console.log('MongoDB connection: ' + conn.connection.host);
        console.log('MongoDB is connected'  );

    } catch (error) {
        console.log('MongoDB connection error: ' + error);
        process.exit(1);
    }
}

module.exports = connectDB; // Use CommonJS export