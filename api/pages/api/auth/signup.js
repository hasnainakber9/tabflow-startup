import { connectDB } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = await connectDB();
    const users = db.collection('users');

    // Check if user exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await users.insertOne({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      createdAt: new Date(),
      plan: 'free',
      settings: {
        autoGroupTabs: true,
        enableNotifications: true,
        enableAI: false,
        enableSync: true
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: result.insertedId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: result.insertedId,
        email,
        name: name || email.split('@')[0],
        plan: 'free'
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}