module.exports = {
  success: (data) => ({
    status: 'SUCCESS',
    data,
  }),
  empty: (message) => ({
    status: 'EMPTY',
    message,
  }),
  error: (message, { error }) => ({
    status: 'ERROR',
    message,
    error,
  }),
};
