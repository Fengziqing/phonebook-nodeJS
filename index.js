const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan('tiny'))
morgan.token('haru', function(request,response){
    return JSON.stringify(request.body);
})
morgan.format('joke',':haru')
app.use(morgan('joke'))
let phonebook = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]

const PORT = process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
})

app.get('/api/persons',(request,response) => {
    response.json(phonebook)
})

app.get('/info',(request,response) => {
    response.send(`Phonebook has info for ${phonebook.length} people ${new Date()}`)
})

app.get('/api/persons/:id',(request,response) => {
    const id = Number(request.params.id)
    const person = phonebook.find(p => p.id === id)
    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
})

app.delete('/api/persons/:id',(request,response) => {
    const id = Number(request.params.id)
    const person = phonebook.find(p => p.id === id)
    if(person){
        phonebook = phonebook.filter(p => p.id !== id)
        response.status(204).end()
    }else{
        response.status(404).end()
    }
})
const requstId = () => {
    return Math.floor(Math.random()*10000000000)
}
app.post('/api/persons',(request,response) => {
    const data = request.body
    if(data.name == null || data.number == null){
        response.status(400).json({
            error: 'need a name or number'
        })
        return
    }
    if(phonebook.find(p => p.name === data.name)){
        response.status(400).json({
            error: 'name must be unique'
        })
        return
    }
    const person = {
        id: requstId(),
        name: data.name,
        number: data.number,
    }
    phonebook = phonebook.concat(person)
    console.log(phonebook)
    response.status(200).json(person)
})