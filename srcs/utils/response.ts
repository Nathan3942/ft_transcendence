/* ce fichier definit le format des reponses simple
qui n'ont pas besoin de passer par le handler global */
// Réponse standard pour un succès

export function success<T>(payload: T) {
    return {
        data: payload
    };
}

// Réponse standard pour une erreur (conforme au contrat)
export function errorResponse(
    error: string, // nom de l'erreur (ex: "BadRequestError")
    message: string,
    code: number,
    details: any[] = []
) {
    return {
        error,
        message,
        code,
        details
    };
}