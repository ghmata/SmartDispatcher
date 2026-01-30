const assert = require('assert');
const LoadBalancer = require('../src/modules/whatsapp/loadBalancer');
const Dispatcher = require('../src/modules/dispatch/dispatcher');

(async () => {
  let waitCalled = false;
  let sendCalled = false;

  const mockClient = {
    id: 'chip_mock',
    isReady: () => true,
    waitUntilReady: async () => {
      waitCalled = true;
    },
    sendMessage: async () => {
      sendCalled = true;
    },
  };

  const sessionManager = {
    getActiveSessions: () => [mockClient],
  };

  const balancer = new LoadBalancer(sessionManager);
  const dispatcher = new Dispatcher(balancer);

  dispatcher.compliance.getTypingDelay = () => 0;
  dispatcher.compliance.getVariableDelay = () => 0;

  await dispatcher.dispatch('5511999999999', 'Teste de envio', false);

  assert.ok(waitCalled, 'Expected waitUntilReady to be called');
  assert.ok(sendCalled, 'Expected sendMessage to be called');

  console.log('READY -> SEND test passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
