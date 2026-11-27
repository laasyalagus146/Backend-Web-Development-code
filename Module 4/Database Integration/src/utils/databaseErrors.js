
function handleDatabaseError(error) {
  if (error.code === 'P2002') {
    const err = new Error('A record with this value already exists');
    err.statusCode = 409;
    return err;
  }

  if (error.code === 'P2003') {
    const err = new Error('Invalid relationship reference');
    err.statusCode = 400;
    return err;
  }

  return error;
}

module.exports = handleDatabaseError;
