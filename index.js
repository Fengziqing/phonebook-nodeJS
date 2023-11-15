require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan('tiny'))
morgan.token('haru', function (request) {
    return JSON.stringify(request.body)
})
morgan.format('joke', ':haru')
app.use(morgan('joke'))

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/info', (request, response) => {
    Person.estimatedDocumentCount().then(result => {
        response.send(`Phonebook has info for ${result} people ${new Date()}`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(result => {
        response.json(result)
    })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).json(result)
    })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    Person.findByIdAndUpdate(request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' })
        .then(result => {
            response.status(200).json(result)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const data = request.body
    // if(data.name == undefined || data.number == undefined){
    //     return response.status(400).json({
    //         error: 'need a name or number'
    //     })
    // }
    const person = new Person({
        name: data.name,
        number: data.number,
    })
    person.save().then(result => {
        response.json(result)
    }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.message === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.message === 'Validation failed') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// 这必须是最后一个载入的中间件。
app.use(errorHandler)