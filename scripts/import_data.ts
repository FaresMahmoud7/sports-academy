import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// This is a template script to import players into the database.
// Since the provided Word documents lacked the required columns (National ID, File Number)
// and the PDF text extraction had encoding issues, we recommend preparing your data in a CSV or JSON file.

// Usage: 
// 1. Prepare a JSON file (e.g., players_data.json) with an array of player objects.
// 2. Run this script using `npx tsx scripts/import_data.ts`

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/champions_academy';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  birthYear: { type: Number, required: true },
  belt: { type: String, default: 'White' },
  danDegree: { type: Number },
  parentPhone: { type: String, required: true },
  registered: { type: Boolean, default: false },
  category: { type: String },
  notes: { type: String },
  trainingType: { type: String },
  fileNumber: { type: String },
  nationalId: { type: String },
  beltDate: { type: String },
});

const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);

async function importData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const dataPath = path.join(__dirname, 'players_data.json');
    if (!fs.existsSync(dataPath)) {
      console.log('No players_data.json found. Please create one to import data.');
      process.exit(0);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const players = JSON.parse(rawData);

    for (const p of players) {
      const newPlayer = new Player(p);
      await newPlayer.save();
      console.log(`Imported: ${p.name}`);
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

importData();
