'use strict'

const { Error } = require('mongoose')
const {
    StatusCodes,
    ReasonPhrases
}= require('../utils/httpStatusCode')


class ErrorResponse extends Error{
    constructor(message,status){
        super(message),
        this.status = status

        Error.captureStackTrace(this,this.constructor)
    }
}

class ConflictRequestError extends ErrorResponse{
    constructor(message= ReasonStatusCode.CONFLICT,statusCode=StatusCodes.FORBIDDEN){
        super(message,statusCode)
    }
}

class BadRequestError extends ErrorResponse{
    constructor(message= ReasonStatusCode.CONFLICT,statusCode=StatusCodes.FORBIDDEN){
        super(message,statusCode)
    }
}

class AuthFailureError extends ErrorResponse{
    constructor(message= ReasonPhrases.UNAUTHORIZED,statusCode=StatusCodes.UNAUTHORIZED){
        super(message,statusCode)
    }
}

class NotFoundError extends ErrorResponse{
    constructor(message= ReasonPhrases.NOT_FOUND,statusCode=StatusCodes.NOT_FOUND){
        super(message,statusCode)
    }
}

class ForbiddenError extends ErrorResponse{
    constructor(message= ReasonPhrases.FORBIDDEN, statusCode=StatusCodes.FORBIDDEN){
        super(message,statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    NotFoundError,
    AuthFailureError,
    ForbiddenError
}