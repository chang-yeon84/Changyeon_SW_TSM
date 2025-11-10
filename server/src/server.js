const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/auth', require('./routes/auth'));

app.get('/', (req, res) => {
    res.send('서버가 실행중입니다!');
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행중입니다`);
});