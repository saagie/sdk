exports.isRequired = (message) => (input) => (input && input.length !== 0 ? true : (message || 'Please provide a value'));
