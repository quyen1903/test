'use strict'

const mongoose = require('mongoose');
const os = require('os');
const process = require('process')
const _SECONDS = 5000;

const countConnect=()=>{
    const numConnection = mongoose.connections.length;
    console.log(`Number of connection is: ${numConnection}`)
}
const checkOverLoad = ()=>{
    setInterval(()=>{
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        //assume maximum number of connection base on number of core
        const maxConnections = numCores*5;
        console.log(`Active connection: ${numConnection}`);
        console.log(`Memory usage:: ${memoryUsage/1024/1024} MB`)
        
        if(numConnection > maxConnections){
            console.log('Connection overload detected!')
        }
    },_SECONDS)//mornitor every 5 seconds
}
module.exports = {
    countConnect,
    checkOverLoad,
}