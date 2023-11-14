const mongoose = require("mongoose")

const url = process.env.MONGODB_URL

mongoose.connect(url)
.then(result => {
    console.log('connect to MongoDB')
})
.catch((error) => {
    console.log('error connecting to MongoDB',error.message)
})

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        require: [true, 'user name required']
    },
    number: {
        type:String,
        minLength:8,
        validate:{
            validator: function(v){
                return /\d{3}-\d*/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        require: [true,'user number required']
    },
})

personSchema.set('toJSON',{
    transform:(document,returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)