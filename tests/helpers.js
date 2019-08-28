const context = {
  succeed: result => {
    return result;
  },
  fail: result => {
    return result;
  }
};

const callback = (error, result) => {
  if (error) {
    throw error;
  }
  return result;
};

module.exports = { context, callback };
