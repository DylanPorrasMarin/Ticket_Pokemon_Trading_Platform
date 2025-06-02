import axios from 'axios';

export const getRandomRarity = (): 'common' | 'rare' | 'epic' => {
  const rarities = ['common', 'rare', 'epic'] as const;
  return rarities[Math.floor(Math.random() * rarities.length)];
};

export const assignStarterPokemons = async (count: number) => {
  const pokemons = [];
  const baseUrl = process.env.POKEAPI_URL?.replace(/\/$/, '') || '';

  for (let i = 0; i < count; i++) {
    const id = Math.floor(Math.random() * 898) + 1;
    const response = await axios.get(`${baseUrl}/${id}`);
    pokemons.push({
      id,
      name: response.data.name,
      level: Math.floor(Math.random() * 100) + 1,
      rarity: getRandomRarity()
    });
  }

  return pokemons;
};

