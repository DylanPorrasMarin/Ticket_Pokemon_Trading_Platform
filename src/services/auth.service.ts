import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { assignStarterPokemons } from '../helpers/pokemon.helper';
import { isValidEmail } from '../utils/email';

export const registerUser = async (username: string, email: string, password: string) => {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const pokemonCount = Number(process.env.STARTER_POKEMON_COUNT) || 3;
  const hashedPassword = await bcrypt.hash(password, 10);
  const pokemons = await assignStarterPokemons(pokemonCount);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    pokemons,
  });

  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<string> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  return token;
};
