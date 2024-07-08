const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const swaggerUi = require('swagger-ui-express');

const http = require('http');
const socketIo = require('socket.io');
const amqp = require('amqplib/callback_api');

const cors = require('cors');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Swagger setup
const swaggerDocs = require('./utils/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notification'));

// Socket.io setup
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// RabbitMQ connection and listening to the queue
amqp.connect(process.env.RABBITMQ_URL, (err, connection) => {
  if (err) throw err;
  connection.createChannel((err, channel) => {
    if (err) throw err;
    const queue = 'notifications';
    channel.assertQueue(queue, { durable: false });

    channel.consume(queue, (msg) => {
      const notification = JSON.parse(msg.content.toString());
      io.emit('notification', notification);
      console.log('Notification sent to clients:', notification);
    }, { noAck: true });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
