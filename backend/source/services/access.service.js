'use strict'

const userModel = require('../models/user.model');
const { writeFile, readFile }= require('node:fs/promises');
const crypto = require('node:crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError,ForbiddenError, AuthFailureError } = require('../core/error.response');

// services //
const { findByEmail } = require('./user.service');
const RoleUser = {
    USER:'USER',
    WRITER:'WRITER',
    EDITOR:'EDITOR',
    ADMIN:'ADMIN'
}

class AccessService{

    static handleRefreshToken = async({ keyStore, user, refreshToken })=>{
        
        const {userId, email} = user;
        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happended, please relogin')
        }

        if(keyStore.refreshToken !== refreshToken )throw new AuthFailureError('something was wrong happended, please relogin')

        const foundUser = await findByEmail({email});
        if(!foundUser) throw new AuthFailureError('user not registed');

        const privateKey =await readFile(`keypool/${email}_private_key.pem`);
        const publicKeyObject = crypto.createPublicKey(keyStore.publicKey);
        const privateKeyObject = crypto.createPrivateKey(privateKey);
        const tokens = await createTokenPair({userId,email},publicKeyObject, privateKeyObject);

        //update token
        await keyStore.updateOne({
            $set:{
                refreshToken:tokens.refreshToken
            },
            $addToSet:{
                refreshTokensUsed:refreshToken
            }
        })

        return {
            user,
            tokens  
        }
    }

    static logout = async(keyStore)=>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        return delKey 
    }
    static login = async({email,password,refreshToken =  null})=>{
        /*
            1 - check email in database
            2 - match password
            3 - create access token, refresh token and save
            4 - generate tokens
            5 - get data return login
         */
        // 1
        const foundUser = await findByEmail({email})
        if(!foundUser) throw new BadRequestError('User not registed');
        // 2
        const salt = foundUser.salt;
        const passwordHashed = await crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex');
        const match = (passwordHashed === foundUser.password);
        if(!match) throw new AuthFailureError('wrong password !!!')
        //3
        /**
         * re-create key-pair for each workstation
         * safer, but reduce our perfomance
         */
        const { privateKey,publicKey } = crypto.generateKeyPairSync('rsa',{
            modulusLength:4096,
            publicKeyEncoding:{
                type:'pkcs1',
                format:'pem'
            },
            privateKeyEncoding:{
                type:'pkcs1',
                format:'pem'
            }
        })
        
        const { _id:userId } = foundUser
        const publicKeyObject = crypto.createPublicKey(publicKey)
        const tokens = await createTokenPair({userId,email},publicKeyObject,privateKey)
        //4n
        await KeyTokenService.createKeyToken({
            refreshToken:tokens.refreshToken,
            publicKey,
            userId:foundUser._id,email
        })  
        //5
        const pemFilePath = `keypool/${email}_private_key.pem`;
        await writeFile(pemFilePath, privateKey);
        return{
            user:getInfoData({field:['_id','email'],object:foundUser}),
            tokens
        }
    }

    static register = async ({name, email, password})=>{
        //check email existed?
        //lean() return pure object js, so everything is faster
        const holderUser = await userModel.findOne({email}).lean()
        if(holderUser){
            throw new BadRequestError('Error: user already registed')
        }
        const salt = crypto.randomBytes(16).toString('hex')
        const passwordHashed = await crypto.pbkdf2Sync(password,salt,1000,64,'sha512').toString('hex')
        const newUser = await userModel.create({
            name, email, password:passwordHashed, salt, roles:[RoleUser.USER]
        });

        //if newUser successfully created
        if(newUser){
            //create private key and public key
            const { privateKey,publicKey } = crypto.generateKeyPairSync('rsa',{
                modulusLength:4096,
                publicKeyEncoding:{
                    type:'pkcs1',
                    format:'pem'
                },
                privateKeyEncoding:{
                    type:'pkcs1',
                    format:'pem'
                }
            })

            /**
             * remmember, good implementation not save private key to database
             * we need to write private key somewhere else
             * this project is implement to pass string directly to postman request
             * not import private key from file
             * but import from file is better solution
            */
            const tokens = await createTokenPair({userId:newUser._id,email},publicKey,privateKey)
            if(!tokens)throw BadRequestError('create tokens error!!!!!!')
            
            //store public key, refreshToken to database
            const keyStore = await KeyTokenService.createKeyToken({
                userId:newUser._id,
                publicKey,
                refreshToken:tokens.refreshToken
            })

            if(!keyStore) throw BadRequestError(' createKeyToken Error!!!');

            //write private key to pem file
            const pemFilePath = `keypool/${email}_private_key.pem`;
            await writeFile(pemFilePath, privateKey);
            return{
                user:getInfoData({field:['_id','name'],object:newUser}),
                tokens,
            }
        }
        return {
            code:200,
            metadata:null
        }
    }
}

module.exports = AccessService