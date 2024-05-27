'use strict'

const mongoose = require('mongoose')
const connectionString = 'mongodb://localhost:27017'

const testSchema = new mongoose.Schema({name:String})
const Test = mongoose.model('Test',testSchema)

describe('Mongoose Connection',()=>{
    let connection;
    beforeAll(async()=>{
        connection = await mongoose.connect(connectionString)
    })

    afterAll( async()=>{
        await connection.disconnect()
    })

    it('should connect to mongoose', ()=>{
        expect(mongoose.connection.readyState).toBe(1)
    })

    it('should save document to database',async ()=>{
        const user = new Test({name: 'Quyen'})
        await user.save()
        expect(user.isNew).toBe(false)
    })

    it('should find document to database',async ()=>{
        const user = await Test.findOne({name: 'Quyen'})
        expect(user).toBeDefined()
        expect(user.name).toBe('Quyen')
    })
})