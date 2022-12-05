const Joi = require('@hapi/joi');
const status = require('http-status');
const createError = require('http-errors');

module.exports.addLocation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().insensitive(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    next(createError(status.BAD_REQUEST, error));
  }
  next();
};
