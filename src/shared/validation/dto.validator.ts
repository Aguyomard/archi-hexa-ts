import Joi from 'joi'

/**
 * Valide un DTO d'entrée en fonction du schéma spécifié
 * @param dto Objet à valider
 * @param schema Schéma Joi de validation
 * @returns {T} L'objet validé ou lance une erreur
 */
export function validateDTO<T>(dto: any, schema: Joi.ObjectSchema): T {
  const { error, value } = schema.validate(dto, {
    abortEarly: false,
    stripUnknown: true,
  })

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ')
    throw new Error(`Validation error: ${errorMessage}`)
  }

  return value
}
