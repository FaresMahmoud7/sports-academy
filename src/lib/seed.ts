import bcrypt from 'bcryptjs';
import dbConnect from './db';
import Admin from '../models/Admin';

export async function seedAdmin() {
  await dbConnect();
  
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('AhmdSalem2026@', salt);
    
    await Admin.create({
      username: 'Ahmd Salem',
      passwordHash,
    });
    console.log('Admin seeded successfully: username "Ahmd Salem", password "AhmdSalem2026@"');
  } else {
    // If the only admin is the old "admin", rename and update its password
    const oldAdmin = await Admin.findOne({ username: 'admin' });
    if (oldAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('AhmdSalem2026@', salt);
      oldAdmin.username = 'Ahmd Salem';
      oldAdmin.passwordHash = passwordHash;
      await oldAdmin.save();
      console.log('Admin updated from "admin" to "Ahmd Salem" successfully');
    }
  }
}
