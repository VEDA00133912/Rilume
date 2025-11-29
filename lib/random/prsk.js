async function fetchRandom(count = 1, difficulty = 'MASTER', level) {
  const params = new URLSearchParams({ count, difficulty });
  if (level != null) params.set('level', level);

  const res = await fetch(`https://random-taiko.onrender.com/api/prsk/random-prsk?${params}`);
  const data = await res.json();

  const key = difficulty.toLowerCase();

  const description = data
    .map((d) => `**${d.name}** ${difficulty}: ${d.difficulties[key] ?? 'N/A'}`)
    .join('\n');

  return { data, description };
}

module.exports = { fetchRandom };
