const app = require('./source/app');
const PORT = process.env.PORT || 4000
const https = require('node:https');
const fs = require('node:fs');

/**
 * comment this line of code in case you wanna use https
 * because both http and https servers run at same port (4000) would cause collision
 */
const server = app.listen(PORT,()=>{
    console.log(`Backend start with port ${PORT}`)
})

/**
 * uncomment this for https
 * but certificate will automatically be ignore by githooks
 * so we still need cert, we can generate in wsl, by openssl tools
 */

// const options={ 
//     key: fs.readFileSync('./certificate/key.pem'),
//     cert: fs.readFileSync('./certificate/cert.pem')
// }
// const sslServer=https.createServer(options,app);
  
// sslServer.listen(PORT,()=>{
//     console.log( `Secure Backend start with port ${PORT}`)
// })