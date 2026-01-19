class AppError extends Error {
  code: number; // HTTP status code
  
  constructor(message:string, code:number) {
    super(message);
    
    this.code = code;
    this.name = "AppError";
  }
}


class NotFoundError extends Error{




    
}