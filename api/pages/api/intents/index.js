import { connectDB } from '../../../lib/mongodb';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    // Verify authentication
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = await connectDB();
    const intents = db.collection('intents');

    if (req.method === 'GET') {
      // Get user's intents
      const userIntents = await intents
        .find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).json({ intents: userIntents });
    } else if (req.method === 'POST') {
      // Create new intent
      const intent = req.body;

      const result = await intents.insertOne({
        ...intent,
        userId: user.userId,
        syncedAt: new Date()
      });

      res.status(201).json({
        success: true,
        intent: { ...intent, _id: result.insertedId }
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Intents API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}