const DIFFICULTY_LABELS = {
  easy: 'かんたん',
  normal: 'ふつう',
  hard: 'むずかしい',
  oni: 'おに',
  edit: 'おに(裏)',
};

function selectDifficulty(d, difficulty, stars) {
  if (difficulty !== 'oni-edit') {
    return { key: difficulty, value: d.difficulties[difficulty] ?? 'N/A', label: DIFFICULTY_LABELS[difficulty] };
  }

  const { oni, edit } = d.difficulties;

  let key;
  if (stars != null) {
    key = oni === stars && edit === stars ? (Math.random() < 0.5 ? 'oni' : 'edit')
        : oni === stars ? 'oni'
        : edit === stars ? 'edit'
        : oni != null ? 'oni' : 'edit';
  } else {
    key = oni != null && edit != null ? (Math.random() < 0.5 ? 'oni' : 'edit')
        : oni != null ? 'oni' : 'edit';
  }

  return { key, value: d.difficulties[key] ?? 'N/A', label: DIFFICULTY_LABELS[key] };
}

async function fetchRandom(count = 1, difficulty = 'oni', stars) {
  const params = new URLSearchParams({ count, difficulty });
  if (stars != null) params.set('stars', stars);

  const res = await fetch(`https://random-taiko.onrender.com/api/taiko/random-taiko?${params}`);
  const data = await res.json();

  const description = data
    .map((d) => {
      const { label, value } = selectDifficulty(d, difficulty, stars);
      return `**${d.title}** ${label}: ★${value}`;
    })
    .join('\n');

  return { data, description };
}

module.exports = { fetchRandom };
