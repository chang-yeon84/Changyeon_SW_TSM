const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log('기존 MongoDB 연결 재사용');
        return cachedConnection;
    }

    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        cachedConnection = connection;
        console.log('MongoDB 연결 성공');
        return connection;
    } catch (error) {
        console.error('MongoDB 연결 실패:', error);
        cachedConnection = null;
        throw error;
    }
};

module.exports = connectDB;