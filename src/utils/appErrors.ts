/*ce fichier contient les erreurs customisees chaque erreur customisee a son propre nom et statusCode
chaque erreur custom herite de la class BaseError
l'erreur custom permet d'utiliser le bon nom et code d'erreur et de throw l'erreur
ensuite le errorHandler global dans utils/errorHandler "catch" l'erreur et fais l'affichage */
export class BaseError extends Error {
  statusCode: number; // HTTP status code
  
  constructor(message:string, code:number) {
    super(message);
    
    this.statusCode = code;
    this.name = "BaseError";
  }
}


export class NotFoundError extends BaseError{
// message name qui vient de error et code

    statusCode:number = 404 // nouveau membre de la classe custom
    constructor(message = "Error Not Found"){
    super(message, 404)

    this.name = "NotFoundError" // overwrite baseError name
    }

}

export class UnauthorizedError extends BaseError{
    statusCode = 401
    constructor(message = "Error Unauthorized"){
        super(message, 401)
        this.name = "UnauthorizedError"
    }
}

export class BadRequestError extends BaseError{
    statusCode = 400

    constructor(message = "Error Bad Request"){
        super(message, 400)
        this.name = "BadRequestError" //modifie name dans error classe parent overwrite
    }
}