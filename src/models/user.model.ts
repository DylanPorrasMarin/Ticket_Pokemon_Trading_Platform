
import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/interfaces';

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pokemons: [
    {
      id: Number,
      name: String,
      level: Number,
      rarity: { type: String, enum: ['common', 'rare', 'epic'], default: 'common' }
    }
  ],
  trades: [{ type: Schema.Types.ObjectId, ref: 'Trade' }],
  successfulTrades: { type: Number, default: 0 }
});

export const User = mongoose.model<IUser>('User', UserSchema);
