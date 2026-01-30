const assert = require('assert');
const { mergeSessions } = require('../lib/sessions-store');

const previous = [
  { id: 'chip_1', status: 'SYNCING', displayOrder: 1 },
  { id: 'chip_2', status: 'READY', displayOrder: 2, phone: '5511999999999' },
];

const incoming = [
  { id: 'chip_2', status: 'READY', displayOrder: 2, phone: '5511999999999' },
];

const merged = mergeSessions(previous, incoming);

assert.strictEqual(merged.length, 2);
assert.strictEqual(merged[0].id, 'chip_1');
assert.strictEqual(merged[0].status, 'SYNCING');
assert.strictEqual(merged[1].id, 'chip_2');

console.log('Session store merge test passed.');
