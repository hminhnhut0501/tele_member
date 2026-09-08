const trials = Number(process.argv[2] ?? 100000);
const groupWeights = { gift: 40, peach: 45, nothing: 15 };
const outcomes = {
  gift: [
    { key: 'voucher-50k', weight: 50 },
    { key: 'vip-code', weight: 30 },
    { key: 'bonus-gift', weight: 20 },
  ],
  peach: [
    { key: 'peach-1', weight: 50 },
    { key: 'peach-3', weight: 30 },
    { key: 'peach-5', weight: 15 },
    { key: 'peach-10', weight: 5 },
  ],
  nothing: [{ key: 'nothing', weight: 100 }],
};

function pick(weighted) {
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll < 0) return item;
  }
  return weighted[weighted.length - 1];
}

const groups = Object.fromEntries(Object.keys(groupWeights).map((key) => [key, 0]));
const selectedOutcomes = {};
for (const group of Object.keys(groupWeights)) {
  for (const outcome of outcomes[group]) selectedOutcomes[outcome.key] = 0;
}

for (let index = 0; index < trials; index += 1) {
  const group = pick(Object.entries(groupWeights).map(([key, weight]) => ({ key, weight })));
  groups[group.key] += 1;
  selectedOutcomes[pick(outcomes[group.key]).key] += 1;
}

console.log(`Wheel simulation: ${trials.toLocaleString('en-US')} spins`);
console.log('Groups:');
for (const [key, count] of Object.entries(groups)) {
  const expected = groupWeights[key];
  const actual = (count / trials) * 100;
  console.log(`  ${key.padEnd(8)} ${actual.toFixed(2)}% (expected ${expected}%)`);
}
console.log('Outcomes:');
for (const [key, count] of Object.entries(selectedOutcomes)) {
  console.log(`  ${key.padEnd(14)} ${(count / trials * 100).toFixed(2)}%`);
}
