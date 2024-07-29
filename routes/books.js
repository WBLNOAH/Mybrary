const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book') 
const uploadPath = path.join('public', Book.coverImageBasePath)
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) =>{
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})
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
router.post('/', upload.single('cover'), async(req, res) =>{
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate), //gives us a string we need to make a date
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  })
  try{
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect('books')
  }catch{
    if (book.coverImageName != null){
      removeBookCover(book.coverImageName)
    }
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
function removeBookCover(fileName){
  fs.unlink(path.join(uploadPath, fileName), err =>{
    if (err) console.error(err)
  })
}

module.exports = router 