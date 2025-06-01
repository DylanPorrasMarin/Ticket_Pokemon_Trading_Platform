// src/types/global.d.ts
export interface Pokemon {
  id: number;
  name: string;
  level: number;
  rarity: 'common' | 'rare' | 'epic';
}

export interface UserTokenPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}
