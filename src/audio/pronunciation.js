export function getPronounceHint(term, guide) {
  if (guide) return guide;
  const key = (term || '').trim().toLowerCase();
  const map = { tr: '쯔', ph: '프', th: '트', nh: '니', ng: '응', ngh: '응', ch: 'ㅉ', gi: '지', kh: 'ㅋㅎ', qu: '꾸' };
  return map[key] || key;
}
