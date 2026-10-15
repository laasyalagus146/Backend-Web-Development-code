
function sendList(res, result) {
  return res.status(200).json({
    data: result.data,
    meta: result.meta
  });
}

function sendCreated(res, post) {
  return res.status(201).json({ data: post });
}

function sendOk(res, payload) {
  return res.status(200).json({ data: payload });
}

function sendError(res, status, payload) {
  const error = {
    code: payload.code || 'INTERNAL_ERROR',
    message: payload.message || 'Something went wrong'
  };

  if (payload.details) {
    error.details = payload.details;
  }

  return res.status(status).json({ error });
}

module.exports = {
  sendList,
  sendCreated,
  sendOk,
  sendError
};
