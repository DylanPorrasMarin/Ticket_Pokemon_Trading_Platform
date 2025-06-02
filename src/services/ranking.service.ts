import { User } from '../models/user.model';

export const getTopTraders = async (limit = 10) => {
  return await User.find()
    .sort({ successfulTrades: -1 })
    .limit(limit)
    .select('username successfulTrades');
};
