// Draws a Monkeytype stats card from Monkeytype's public profile API.
// Replaces the monkeytype-readme action, whose rendering service now returns 404.
// Usage: node monkeytype-card.mjs <username> <out.svg>
import { writeFileSync } from 'node:fs';

const [user, out] = process.argv.slice(2);
const res = await fetch(`https://api.monkeytype.com/users/${encodeURIComponent(user)}/profile`);
if (!res.ok) throw new Error(`Monkeytype API returned ${res.status}`);
const { data } = await res.json();

const esc = (text) => String(text).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const best = (seconds) => (data.personalBests?.time?.[seconds] ?? []).reduce((top, run) => (!top || run.wpm > top.wpm ? run : top), null);
const C = { bg: '#2d394d', main: '#ff7a90', sub: '#4a768d', text: '#fffaf8' }; // Monkeytype "bento"

const cells = ['15', '30', '60', '120'].map((seconds, i) => {
  const pb = best(seconds), x = 30 + i * 115;
  return `<text x="${x}" y="80" fill="${C.sub}" font-size="14">time ${seconds}</text>`
    + `<text x="${x}" y="120" fill="${C.main}" font-size="36" font-weight="700">${pb ? Math.round(pb.wpm) : '-'}</text>`
    + `<text x="${x}" y="142" fill="${C.sub}" font-size="13">${pb ? `${Math.round(pb.acc)}% acc` : 'no pb'}</text>`;
}).join('');
const stats = data.typingStats ?? {};
const hours = ((stats.timeTyping ?? 0) / 3600).toFixed(1);

writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="200" viewBox="0 0 500 200" font-family="'Roboto Mono', ui-monospace, monospace">
<rect width="500" height="200" rx="12" fill="${C.bg}"/>
<text x="30" y="42" fill="${C.text}" font-size="18">monkeytype <tspan fill="${C.sub}">/ ${esc(user)}</tspan></text>
${cells}
<text x="30" y="178" fill="${C.sub}" font-size="13">${stats.completedTests ?? 0} tests completed · ${hours}h typing · personal bests in wpm</text>
</svg>
`);
