const Joi = require("joi");

exports.signupValidation = async (input) => {
  const signupSchema = Joi.object({
    name: Joi.string().min(2).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = await signupSchema.validate(input);
  return error;
};

exports.signInValidation = async (input) => {
  const signInSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = await signInSchema.validate(input);
  return error;
};
