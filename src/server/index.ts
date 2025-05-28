import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import Customer from '../models/Customer';
import CustomerNumber from '../models/CustomerNumber';
import Plan from '../models/Plan';
import CustomerPlan from '../models/CustomerPlan';
import Sale from '../models/Sale';
import Invoice from '../models/Invoice';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

mongoose.connect(process.env.MONGODB_URI!);

// Watch collections for changes
const watchCollections = async () => {
  const collections = [
    { model: Customer, name: 'customers' },
    { model: CustomerNumber, name: 'customerNumbers' },
    { model: Plan, name: 'plans' },
    { model: CustomerPlan, name: 'customerPlans' },
    { model: Sale, name: 'sales' },
    { model: Invoice, name: 'invoices' }
  ];

  collections.forEach(({ model, name }) => {
    const changeStream = model.watch();
    changeStream.on('change', (change) => {
      io.emit(`${name}Change`, change);
    });
  });
};

// Initial data endpoint
app.get('/api/initial-data', async (req, res) => {
  try {
    const [
      customers,
      customerNumbers,
      plans,
      customerPlans,
      sales,
      invoices
    ] = await Promise.all([
      Customer.find(),
      CustomerNumber.find(),
      Plan.find(),
      CustomerPlan.find(),
      Sale.find(),
      Invoice.find()
    ]);

    res.json({
      customers,
      customerNumbers,
      plans,
      customerPlans,
      sales,
      invoices
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch initial data' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

watchCollections();

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});