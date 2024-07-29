const express = require('express')
const router = express.Router()
const Book = require('../models/book')
router.get('/', async (req, res) =>{
  let books;
  try{
    books = await Book.find().sort({createdAt: 'desc'}).limit(10).exec() //shows us 10 most recented created books (descending order)

  } catch{
    books = []
  }
  res.render('index', {books: books})
})

module.exports = router //this exports our router