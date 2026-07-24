const assert = require('assert');
const fs = require('fs');
const path = require('path');

process.env.PASSKEY = 'CIRCLE';
process.env.AUTH_SECRET = 'test-secret-at-least-sixteen-characters';

const unlock = require('../api/unlock');
const session = require('../api/session');
const lock = require('../api/lock');

function response() {
  return {
    code: null,
    headers: {},
    payload: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    json(value) { this.payload = value; return this; }
  };
}

function call(handler, req) {
  const res = response();
  handler(req, res);
  return res;
}

const bad = call(unlock, { method: 'POST', headers: {}, body: { passkey: 'WRONG' } });
assert.equal(bad.code, 401);

const good = call(unlock, { method: 'POST', headers: {}, body: { passkey: 'CIRCLE' } });
assert.equal(good.code, 200);
assert.match(good.headers['Set-Cookie'], /sc_access=/);
assert.match(good.headers['Set-Cookie'], /HttpOnly/);
assert.match(good.headers['Set-Cookie'], /Secure/);

const cookie = good.headers['Set-Cookie'].split(';')[0];
const active = call(session, { method: 'GET', headers: { cookie } });
assert.equal(active.code, 200);
assert.equal(active.payload.unlocked, true);

const inactive = call(session, { method: 'GET', headers: {} });
assert.equal(inactive.payload.unlocked, false);

const locked = call(lock, { method: 'POST', headers: { cookie } });
assert.equal(locked.code, 200);
assert.match(locked.headers['Set-Cookie'], /Max-Age=0/);

for (const file of ['index.html', '001/index.html', '002/index.html', '003/index.html', '003.1/index.html', '003.2/index.html', 'assets/site.css', 'assets/site.js', 'assets/protected.js', 'assets/logo.png', 'vercel.json']) {
  assert.ok(fs.existsSync(path.join(__dirname, '..', file)), `Missing ${file}`);
}

for (const file of ['index.html', '001/index.html', '002/index.html', '003/index.html', '003.1/index.html', '003.2/index.html']) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /viewport/);
}

console.log('Small Circle tests passed.');
