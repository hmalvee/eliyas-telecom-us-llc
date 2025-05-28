import mongoose from 'mongoose';
import User from '../models/User';
import * as bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const adminExists = await (User as any).findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await (User as any).create({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();