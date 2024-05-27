'use strict'

const JWT = require('jsonwebtoken');
const { asyncHandler} = require('../helper/asyncHandler');
const { findByUserId } = require('../services/keyToken.service');
const { AuthFailureError,NotFoundError, BadRequestError } = require('../core/error.response')
const crypto = require('node:crypto')

const HEADER = {
    CLIENT_ID:'x-client-id',
    AUTHORIZATION:'authorization',
    REFRESHTOKEN:'x-rtoken-id',
}

const createTokenPair = async (payload, publicKey, privateKey)=>{
    try {
        const accessToken = await JWT.sign(payload,privateKey,{
            expiresIn:'2 days',
            algorithm:'RS256'
        })
        const refreshToken= await JWT.sign(payload,privateKey,{
            expiresIn:'7 days',
            algorithm:'RS256'
        })

        //
        JWT.verify(accessToken,publicKey,(err,decode)=>{
            if(err){
                throw new BadRequestError(' JWT verify error :::',err)
            }else{
                console.log(`decode verify`,decode)
            }
        })
        return {accessToken,refreshToken}
    } catch (error) {
        console.log('Authentication Utilities error:::',error)
    }
}

const authentication = asyncHandler(async(req,res,next)=>{
    /* 
        1 - check userId misssing
        2 - get acccess token
        3 - verify Token
        4 - check user in database
        5 - check keyStore with this userId
        6 - OK => return next()
    */

    //1
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid Request')

    //2
    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not Found Keystore')

    //3
    if(req.headers[HEADER.REFRESHTOKEN]){
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify(refreshToken ,keyStore.privateKey)
            if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User Id')
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }
    
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        //convert publicKey from string to RSA
        const publicKeyObject = crypto.createPublicKey(keyStore.publicKey);
        const decodeUser = JWT.verify(accessToken,publicKeyObject)
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User Id');
        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
        console.error(error)
        throw error
    }
})

const verifyJWT = async(token,keySecret)=>{
    return await JWT.verify(token,keySecret)
}

module.exports={
    createTokenPair,
    authentication,
    verifyJWT,
}