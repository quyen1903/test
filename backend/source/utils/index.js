'use strict'
const _ = require('lodash');
const { Types } = require('mongoose');

const convertToObjectIdMongodb = id => new Types.ObjectId(id)

const getInfoData = ({field = [],object ={}})=>{
    return _.pick(object,field)
}

//['a','b'] => {a:1,b:1}
const getSelectData = (select = [])=>{
    return Object.fromEntries(select.map(element => [element,1]))
}

//['a','b'] => {a:0,b:0}
const unGetSelectData = (select = [])=>{
    return Object.fromEntries(select.map(element => [element,0]))
}

const removeUndefinedObject = object =>{
    Object.keys(object).forEach(key =>{
        if(object[key] == null){
            delete object[key]
        }
    })
    return object
}

/**
 * we use recursion 
 * first thing first, loop through object key 
 * && !Array because behind the scense, array is object, too
 * if key of object is object, we pass it to updateNestedObjectParser
 * which means it this is recursion
 * this allows us to wipe out null which is inside of nested object
 * a:{
 *    b:{
 *      c:null,
 *      d:'this not null'
 *    }
 *  };
 * like this
 */
const updateNestedObjectParser = object =>{
    const final = {}
    Object.keys(object).forEach(key =>{
        if(typeof object[key] === 'object' && !Array.isArray(object[key])){
            const response = updateNestedObjectParser(object[key])
            Object.keys(response).forEach(a =>{
                final[`${key}.${a}`] = response[a]
            })
        }else{
            final[key] = object[key]
        }
    })
    return final
}




module.exports={
    getInfoData ,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb,
}