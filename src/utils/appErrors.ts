/*ce fichier contient les erreurs customisees chaque erreur customisee a son propre nom et statusCode
chaque erreur custom herite de la class BaseError
l'erreur custom permet d'utiliser le bon nom et code d'erreur et de throw l'erreur
ensuite le errorHandler global dans utils/errorHandler "catch" l'erreur et fais l'affichage */
export class BaseError extends Error {
    statusCode: number; // HTTP status code
    details: any[];

    constructor(message: string, code: number, details: any[] = []) { // details vide par defaut
        super(message);
        this.statusCode = code;
        this.name = "BaseError";
        this.details = details;
    }
}


export class NotFoundError extends BaseError {
    statusCode: number = 404;
    constructor(message = "Error Not Found", details: any[] = []) {
        super(message, 404, details);
        this.name = "NotFoundError";
    }
}

export class UnauthorizedError extends BaseError {
    statusCode = 401;
    constructor(message = "Error Unauthorized", details: any[] = []) {
        super(message, 401, details);
        this.name = "UnauthorizedError";
    }
}

export class BadRequestError extends BaseError {
    statusCode = 400;
    constructor(message = "Error Bad Request", details: any[] = []) {
        super(message, 400, details); //constructor base class
        this.name = "BadRequestError";
    }
}