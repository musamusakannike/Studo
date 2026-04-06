import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import Wallet from '../models/wallet.model';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedWallets = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/studo';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    const users = await User.find({});
    console.log(`Found ${users.length} users. Processing wallets...`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const user of users) {
      const existingWallet = await Wallet.findOne({ user: user._id });

      if (existingWallet) {
        existingWallet.balance = 50000;
        // Optionally add dummy DVA if missing
        if (!existingWallet.accountNumber) {
          existingWallet.accountNumber = Math.random().toString().slice(2, 12);
          existingWallet.accountName = user.fullName.toUpperCase();
          existingWallet.bankName = 'Wema Bank (Test)';
          existingWallet.isActive = true;
        }
        await existingWallet.save();
        updatedCount++;
      } else {
        await Wallet.create({
          user: user._id,
          balance: 50000,
          accountNumber: Math.random().toString().slice(2, 12),
          accountName: user.fullName.toUpperCase(),
          bankName: 'Wema Bank (Test)',
          isActive: true,
        });
        createdCount++;
      }
    }

    console.log(`Finished processing wallets!`);
    console.log(`Created: ${createdCount}`);
    console.log(`Updated: ${updatedCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding wallets:', error);
    process.exit(1);
  }
};

seedWallets();
