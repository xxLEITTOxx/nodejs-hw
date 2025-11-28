import { Joi, Segments } from 'celebrate';

export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const refreshUserSessionSchema = {
  [Segments.COOKIES]: Joi.object({
    sessionId: Joi.string().required(),
    refreshToken: Joi.string().required(),
  }).unknown(true),
};
