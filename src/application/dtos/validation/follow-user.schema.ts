import Joi from 'joi'
import { FollowUserInputDTO } from '../follow-user.dto'

export const followUserSchema = Joi.object<FollowUserInputDTO>({
  userToFollow: Joi.string().min(3).max(50).required().messages({
    'string.base': "L'utilisateur à suivre doit être une chaîne de caractères",
    'string.empty': "L'utilisateur à suivre ne peut pas être vide",
    'string.min':
      "L'utilisateur à suivre doit contenir au moins {#limit} caractères",
    'string.max':
      "L'utilisateur à suivre ne peut pas dépasser {#limit} caractères",
    'any.required': "L'utilisateur à suivre est requis",
  }),
})
