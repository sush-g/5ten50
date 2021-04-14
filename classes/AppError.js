const constants = require('../constants');

const error_type_set = new Set(Object.values(constants.ERROR_TYPES));

class AppError extends Error {
  constructor(error_type, message) {
    super(message);
    if (error_type_set.has(error_type)) {
      this._error_type = error_type;
    } else {
      throw new ValueError('AppError failed to create, error type is not valid.');
    }
  }

  get error_type() {
    return this._error_type;
  }

  getJSON() {
    return {
      error_type: this.error_type,
      message: this.message
    }
  }
}

module.exports = AppError;
