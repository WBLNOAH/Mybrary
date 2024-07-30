const express = require('express')
const router = express.Router()
const Book = require('../models/book') 
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//All Books route authors/
router.get('/', async (req, res) =>{
  let query = Book.find() //this returns a query object which we can use
  if (req.query.title != null && req.query.title != ''){
    query = query.regex('title', new RegExp(req.query.title, 'i')) //appends the title to our query (search bar i think)
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != ''){
    query = query.lte('publishDate', req.query.publishedBefore) //query less than or equal to
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != ''){
    query = query.gte('publishDate', req.query.publishedAfter) //query less than or equal to
  }
  try{
    const books = await query.exec() //executes our query
    res.render('books/index', { //giving the index.ejs file 2 objects books and searchOptions which it can use
      books: books,
      searchOptions: req.query
    })
  }catch{
    res.redirect('/')
  }
})

//New book route  authors/new
router.get('/new', async(req, res) =>{
  renderNewPage(res, new Book())
}) 

//Create book route
router.post('/', async(req, res) =>{
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate), //gives us a string we need to make a date
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book, req.body.cover)

  try{
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect('books')
  }catch{
    renderNewPage(res, book, true)
  }
})

async function renderNewPage(res, book, hasError = false){
  try{
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) params.errorMessage = 'Error creating Book'
    res.render('books/new', params)
  } catch {
    res.redirect('/books')
  }
}


function saveCover(book, coverEncoded){
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router 