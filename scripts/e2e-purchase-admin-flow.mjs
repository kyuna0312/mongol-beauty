#!/usr/bin/env node

const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:4000/graphql';
const paymentInternalUrl =
  process.env.PAYMENT_INTERNAL_URL || 'http://localhost:4020/internal/payments/upload-receipt';
const internalToken = process.env.INTERNAL_SERVICE_TOKEN || 'dev-internal-token';
const userToken = process.env.E2E_USER_JWT;
const adminToken = process.env.E2E_ADMIN_JWT;
const productId = process.env.E2E_PRODUCT_ID;

if (!userToken || !adminToken || !productId) {
  console.error('Missing required env vars: E2E_USER_JWT, E2E_ADMIN_JWT, E2E_PRODUCT_ID');
  process.exit(1);
}

async function gql(query, variables, token, headers = {}) {
  const res = await fetch(gatewayUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join('; '));
  }
  return body.data;
}

const idempotencyKey = `e2e-${Date.now()}`;

const createOrderMutation = `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) { id status totalPrice }
  }
`;

const updateStatusMutation = `
  mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, status: $status) { id status paymentReceiptUrl }
  }
`;

const getOrderQuery = `
  query GetOrder($id: ID!) {
    order(id: $id) { id status paymentReceiptUrl }
  }
`;

const created = await gql(
  createOrderMutation,
  {
    input: {
      items: [{ productId, quantity: 1 }],
    },
  },
  userToken,
  { 'x-idempotency-key': idempotencyKey },
);

const orderId = created.createOrder.id;
console.log(`Created order ${orderId}`);

const receiptRes = await fetch(paymentInternalUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-internal-token': internalToken,
  },
  body: JSON.stringify({
    orderId,
    fileUrl: '/uploads/receipts/e2e-receipt.png',
  }),
});
if (!receiptRes.ok) {
  throw new Error(`Receipt upload simulation failed: ${await receiptRes.text()}`);
}

await gql(updateStatusMutation, { orderId, status: 'PAID_CONFIRMED' }, adminToken);
const after = await gql(getOrderQuery, { id: orderId }, adminToken);

if (after.order.status !== 'PAID_CONFIRMED') {
  throw new Error(`Expected PAID_CONFIRMED status but got ${after.order.status}`);
}
if (!after.order.paymentReceiptUrl) {
  throw new Error('Expected paymentReceiptUrl to be present');
}

console.log('E2E flow passed: purchase -> receipt -> admin confirm');
