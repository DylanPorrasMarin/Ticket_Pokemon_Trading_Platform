// src/models/trade.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import { ITrade } from '../types/interfaces';

const TradeSchema = new Schema<ITrade>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderPokemon: { type: Number, required: true },
  receiverPokemon: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const Trade = mongoose.model<ITrade>('Trade', TradeSchema);
