if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')

app.set('view engine', 'ejs') //using ejs view engine
app.set('views', __dirname + '/views') //our views are located in this folder
app.set('layout', 'layouts/layout') //our layout is in this folder
app.use(expressLayouts) //we are using our express layouts
app.use(express.static('public')) //this is where our code and HTML is 

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', ()=> console.log('Connected to mongoose'))

app.use('/', indexRouter) //when we use this path (in this case the default path we use the indexRouter)

app.listen(process.env.PORT || 3000)