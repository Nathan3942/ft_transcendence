
export function success<T>(payload: T) {
    return {
        data: payload
    };
}

export function errorResponse(
    error: string,
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