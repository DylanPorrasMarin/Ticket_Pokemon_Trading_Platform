import mongoose, { Document } from 'mongoose';

// src/types/interfaces.ts
export interface UserTokenPayload {
  id: string;
}

export interface IPokemon {
  id: number;
  name: string;
  level: number;
  rarity: 'common' | 'rare' | 'epic';
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  pokemons: IPokemon[];
  trades: mongoose.Types.ObjectId[];
  successfulTrades: number;
}

export interface ITrade extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  senderPokemon: number;
  receiverPokemon: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}