export function getNumber(key, fallback = 0) {
  return Number(localStorage.getItem(key) || fallback);
}

export function getString(key, fallback = "") {
  return localStorage.getItem(key) || fallback;
}

export function getJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function setString(key, value) {
  localStorage.setItem(key, value);
}
