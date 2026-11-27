
require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());

app.use('/auth', authRoutes);

// Centralized error handler
app.use((error, req, res, next) => {
  const status = error.status || 500;

  if (status === 500) {
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }

  return res.status(status).json({
    error: {
      code: error.code,
      message: error.message
    }
  });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
