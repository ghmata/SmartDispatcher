const assert = require('assert');
const LoadBalancer = require('../src/modules/whatsapp/loadBalancer');

const clientA = { id: 'chip_1', isReady: () => true };
const clientB = { id: 'chip_2', isReady: () => true };

const balancer = new LoadBalancer();

balancer.addClient(clientA);
balancer.addClient(clientB);

assert.strictEqual(balancer.getNextClient().id, 'chip_1');
assert.strictEqual(balancer.getNextClient().id, 'chip_2');
assert.strictEqual(balancer.getNextClient().id, 'chip_1');

console.log('LoadBalancer test passed.');
