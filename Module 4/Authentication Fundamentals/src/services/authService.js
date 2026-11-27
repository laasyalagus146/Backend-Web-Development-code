
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 10;

// Valid dummy hash work for unknown-email login attempts.
const dummyHashPromise = bcrypt.hash('dummy-password', SALT_ROUNDS);

function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function invalidCredentials() {
  return createError(
    401,
    'INVALID_CREDENTIALS',
    'Invalid email or password'
  );
}

function validateFields(fields) {
  return Object.values(fields).every(
    value => typeof value === 'string' && value.trim().length > 0
  );
}

// Only expose safe user information.
function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

// REGISTER
async function register({ name, email, password }) {
  if (!validateFields({ name, email, password })) {
    throw createError(400, 'VALIDATION_ERROR', 'All fields are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();

  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw createError(
      409,
      'EMAIL_EXISTS',
      'An account with this email already exists'
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await userRepository.createUser({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash
    });

    return serializeUser(user);
  } catch (error) {
    // Handles concurrent duplicate registrations.
    if (error.code === 'P2002') {
      throw createError(
        409,
        'EMAIL_EXISTS',
        'An account with this email already exists'
      );
    }

    throw error;
  }
}

// LOGIN
async function login({ email, password }) {
  if (!validateFields({ email, password })) {
    throw createError(400, 'VALIDATION_ERROR', 'Email and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    const dummyHash = await dummyHashPromise;
    await bcrypt.compare(password, dummyHash);
    throw invalidCredentials();
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw invalidCredentials();
  }

  return serializeUser(user);
}

module.exports = {
  register,
  login
};
