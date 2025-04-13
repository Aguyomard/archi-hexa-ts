import Joi from 'joi'
import { CreateUserInputDTO } from '../create-user.dto'

export const createUserSchema = Joi.object<CreateUserInputDTO>({
  name: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Le nom doit être une chaîne de caractères',
    'string.empty': 'Le nom ne peut pas être vide',
    'string.min': 'Le nom doit contenir au moins {#limit} caractères',
    'string.max': 'Le nom ne peut pas dépasser {#limit} caractères',
    'any.required': 'Le nom est requis',
  }),
})
