import { User } from '../models/user.model';

export const getUserPokemons = async (userId: string) => {
  const user = await User.findById(userId).select('pokemons');

  if (!user) {
    throw new Error('User not found');
  }

  return user.pokemons;
};

export const getAllUsersWithPokemons = async () => {
  const users = await User.find().select('username pokemons');
  return users;
};