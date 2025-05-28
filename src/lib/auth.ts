import jwt from 'jsonwebtoken';
import { connectDB } from './db';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function verifyUser(email: string, password: string) {
  const db = await connectDB();
  const user = await db.collection('users').findOne({ email });

  if (!user || user.password !== password) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { 
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, user: {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role
  }};
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const db = await connectDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}