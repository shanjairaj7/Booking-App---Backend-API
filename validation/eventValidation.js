const Joi = require("joi");

exports.createEventValidation = async (input) => {
  const eventSchema = Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().min(2).required(),
    date: Joi.string().required(),
  });

  const { error } = await eventSchema.validate(input);
  return error;
};
