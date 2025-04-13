import Joi from 'joi'
import { UserParamDTO } from '../user-param.dto'

export const userParamSchema = Joi.object<UserParamDTO>({
  user: Joi.string().min(3).max(50).required().messages({
    'string.base': "Le nom d'utilisateur doit être une chaîne de caractères",
    'string.empty': "Le nom d'utilisateur ne peut pas être vide",
    'string.min':
      "Le nom d'utilisateur doit contenir au moins {#limit} caractères",
    'string.max':
      "Le nom d'utilisateur ne peut pas dépasser {#limit} caractères",
    'any.required': "Le nom d'utilisateur est requis",
  }),
})
