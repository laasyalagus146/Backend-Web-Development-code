
'use strict';
// routes/payments.js

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  // Rule 1: Reject requests without an idempotency key
  const key = req.headers['idempotency-key'];

  if (!key) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency key is required',
      },
    });
  }

  // Rule 2: Return the stored response for repeated keys
  if (idempotency.has(key)) {
    const { status, body } = idempotency.get(key);
    return res.status(status).json(body);
  }

  // Rule 3: Create a new charge
  const amount = req.body && req.body.amount;

  const charge = {
    id: nextChargeId(),
    amount,
    status: 'charged',
  };

  charges.push(charge);

  const responseBody = {
    id: charge.id,
    amount: charge.amount,
    status: charge.status,
  };

  // Store the response for future retries
  idempotency.set(key, {
    status: 201,
    body: responseBody,
  });

  return res.status(201).json(responseBody);
});

module.exports = router;
