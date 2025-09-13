const axios = require('axios');

async function fetchRandom(count = 1, difficulty = 'MASTER', level) {
  const params = { count, difficulty };

  if (level != null) params.level = level;

  const res = await axios.get(
    'https://random-taiko.onrender.com/api/prsk/random-prsk',
    { params },
  );
  const data = res.data;

  const description = data
    .map((d) => {
      const keyForJson = difficulty.toLowerCase();
      const diffValue = d.difficulties[keyForJson] ?? 'N/A';

      return `**${d.name}** ${difficulty.toUpperCase()}: ${diffValue}`;
    })
    .join('\n');

  return { data, description };
}

module.exports = { fetchRandom };
