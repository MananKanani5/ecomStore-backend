import Joi from "joi";

const userRegisterSchema = Joi.object({
    firstName: Joi.string().required().allow(''),
    lastName: Joi.string().required().allow(''),
    email: Joi.string().email().required(),
    password: Joi.string().required().allow(''),
    phone: Joi.string().required().allow('')
}).options({ allowUnknown: true });

const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const validateUserRegister = (data: any) => userRegisterSchema.validate(data);
export const validateLoginUserSchema = (data: any) => loginUserSchema.validate(data);