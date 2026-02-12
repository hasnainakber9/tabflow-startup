import { connectDB } from '../../lib/mongodb';
import { verifyToken } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { intents, stats } = req.body;
    const db = await connectDB();

    // Sync intents
    if (intents && intents.length > 0) {
      const intentsCollection = db.collection('intents');
      
      for (const intent of intents) {
        await intentsCollection.updateOne(
          { id: intent.id, userId: user.userId },
          { $set: { ...intent, userId: user.userId, syncedAt: new Date() } },
          { upsert: true }
        );
      }
    }

    // Sync stats
    if (stats) {
      const statsCollection = db.collection('stats');
      await statsCollection.updateOne(
        { userId: user.userId },
        { $set: { ...stats, userId: user.userId, updatedAt: new Date() } },
        { upsert: true }
      );
    }

    res.status(200).json({ success: true, message: 'Data synced successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
}