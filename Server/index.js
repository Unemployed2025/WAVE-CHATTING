const express = require('express');
const cors = require('cors');
const http = require('http');
const initSocket = require('./config/socket');

const router = require('./routes/index.js');
const app = express();
const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: process.env.UI_URL,
    credentials: true
}));

app.use('/api', router);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});