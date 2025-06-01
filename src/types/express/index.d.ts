import { UserTokenPayload } from '../global';

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload; // debe ser un objeto, no string
    }
  }
}
