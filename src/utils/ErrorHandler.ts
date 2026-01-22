/*ce fichier contient le errorHandler passé a fastify grace a la fonction setErrorHandler dans index.ts
fastify a un handler d'erreur par defaut qui catch toutes les erreurs
qui sont throw automatiquement et qui renvoie le status code 500 et un message generique
on peut customiser ce handler en utilisant la fonction setErrorHandler() et en lui passant
notre handler custom/ voici mon handler custom */
import type { FastifyRequest, FastifyReply } from "fastify";
import { BaseError } from "./appErrors";

export function errorHandler(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log("Error received:", error);
  console.log("Instance of BaseError:", error instanceof BaseError);

  if (error instanceof BaseError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      details: error.details ?? []
    });
  }

  //callback au cas ou erreur inattendue aucune erreur custom 
  request.log.error(error);
  return reply.status(500).send({
    error: "InternalServerError",
    message: "Unexpected error",
    details: []
  });
}

//handler pour les route not found 404
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send({
    error: "NotFound",
    message: "Route not found",
    details: []
  })
}