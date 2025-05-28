const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/eliyas_telecom')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Load models
require('./models/Customer');
require('./models/Sale');
require('./models/Invoice');
require('./models/Plan');

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('addCustomer', async (customerData) => {
    try {
      const Customer = mongoose.model('Customer');
      const customer = new Customer(customerData);
      await customer.save();
      io.emit('customerAdded', customer);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('addSale', async (saleData) => {
    try {
      const Sale = mongoose.model('Sale');
      const sale = new Sale(saleData);
      await sale.save();
      io.emit('saleAdded', sale);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});