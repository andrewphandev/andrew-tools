const Joi = require('@hapi/joi');
const status = require('http-status');
Joi.objectId = require('joi-objectid')(Joi);
const createError = require('http-errors');

module.exports.addDevice = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().insensitive(),
    type: Joi.string()
      .valid(
        'SYSTEM_TB',
        'FUNCTIONAL_TB',
        'SERVER',
        'STANDALONE_CEDGE',
        'STANDALONE_VEDGE',
      )
      .required(),
    // owner: Joi.objectId().required(),
    owner: Joi.string().required().insensitive(),
    location: Joi.string().required().insensitive(),
    building: Joi.string().required().insensitive(),
    lab: Joi.string().required().insensitive(),
    rack: Joi.string().required().insensitive(),
    assle: Joi.string().required().insensitive(),
    isDMZ: Joi.boolean().required(),
    ipAddress: Joi.string()
      .required()
      .insensitive()
      .regex(
        new RegExp(
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        ),
      )
      .messages({
        'string.pattern.base': 'Invalid IP address',
      }),
    username: Joi.string().min(3).required().insensitive(),
    password: Joi.string().required().insensitive(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    next(createError(status.BAD_REQUEST, error));
  }
  next();
};

module.exports.checkIpAddress = (req, res, next) => {
  const schema = Joi.object({
    ipAddress: Joi.string()
      .required()
      .insensitive()
      .regex(
        new RegExp(
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        ),
      )
      .messages({
        'string.pattern.base': 'Invalid IP address',
      }),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    next(createError(status.BAD_REQUEST, error));
  }
  next();
};
