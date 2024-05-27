'use strict'

const AccessService = require("../services/access.service")

const { OK, CREATED, SuccessResponse } = require('../core/success.response')

class AccessController{

    handlerRefreshToken = async(req,res,next)=>{
        // new SuccessResponse({
        //     message:'get token success',
        //     metadata:await AccessService.handleRefreshToken(req.body.refreshToken)
        // }).send(res)

        //edited, no need   accessToken 
        console.log('this is req.body',req.body);
        new SuccessResponse({
            message:'get token success',
            metadata:await AccessService.handleRefreshToken({
                keyStore:req.keyStore,
                user:req.user,
                refreshToken:req.body.refreshToken,
                privateKey:req.body.privateKey,
            })
        }).send(res)
        
    }
    
    logout = async(req,res,next)=>{
        new SuccessResponse({
            message:'logout success',
            metadata:await AccessService.logout( {keyStore:req.keyStore} )
        }).send(res)
    }
    login = async(req,res,next)=>{
        new SuccessResponse({
            metadata:await AccessService.login(req.body)
        }).send(res)
    }
    register = async(req,res,next)=>{
        new CREATED({
            message:'registed OK',
            metadata:await AccessService.register(req.body)//invoke AccessService.signUp(req.body) and attach to metadata
        }).send(res)
    }

}
module.exports = new AccessController()