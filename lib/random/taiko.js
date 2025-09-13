const axios = require('axios');

const taikoDifficultyJP = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
  oni: 'おに',
  edit: 'おに(裏)',
};

function selectDifficulty(d, difficulty, stars) {
  let diffKey = difficulty;

  if (difficulty === 'oni-edit') {
    const oni = d.difficulties['oni'];
    const edit = d.difficulties['edit'];

    if (stars != null) {
      if (oni === stars && edit === stars)
        diffKey = Math.random() < 0.5 ? 'oni' : 'edit';
      else if (oni === stars) diffKey = 'oni';
      else if (edit === stars) diffKey = 'edit';
      else diffKey = oni != null ? 'oni' : 'edit';
    } else {
      if (oni != null && edit != null)
        diffKey = Math.random() < 0.5 ? 'oni' : 'edit';
      else diffKey = oni != null ? 'oni' : 'edit';
    }
  }

  return {
    key: diffKey,
    value: d.difficulties[diffKey] ?? 'N/A',
    label: taikoDifficultyJP[diffKey] || diffKey,
  };
}

async function fetchRandom(count = 1, difficulty = 'oni', stars) {
  const params = { count, difficulty };

  if (stars != null) params.stars = stars;

  const res = await axios.get(
    'https://random-taiko.onrender.com/api/taiko/random-taiko',
    { params },
  );
  const data = res.data;

  const description = data
    .map((d) => {
      const { label, value } = selectDifficulty(d, difficulty, stars);

      return `**${d.title}** ${label}: ★${value}`;
    })
    .join('\n');

  return { data, description };
}

module.exports = { fetchRandom };
