const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
mongoose.connect('mongodb://admin:admin123@localhost:27017/eliyas_telecom', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Load models
const User = require('./models/User');
const Customer = require('./models/Customer');
const Sale = require('./models/Sale');
const Invoice = require('./models/Invoice');
const Plan = require('./models/Plan');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  } else {
    next();
  }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  // Auth events
  socket.on('signIn', async ({ email, password }, callback) => {
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      callback({ 
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      callback({ error: error.message });
    }
  });

  socket.on('verifyToken', async (token, callback) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) throw new Error('User not found');

      callback({ 
        valid: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      callback({ valid: false });
    }
  });

  socket.on('signOut', () => {
    socket.user = null;
  });

  // Data events
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