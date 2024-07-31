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
    res.redirect(`books/${newBook.id}`)
  }catch{
    renderNewPage(res, book, true)
  }
})

router.get('/new', async(req, res) =>{
  renderNewPage(res, new Book())
}) 

//update book route
router.put('/:id', async(req, res) =>{
  let book
  try{
    book = await Book.findById(req.params.id);
    book.title = req.body.title 
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate) 
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover !== ''){
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  }catch{
    if (book != null){
      renderEditPage(res,book,true)
    } else {
      redirect('/')
    }
  }
})


//show book route
router.get('/:id', async(req, res) =>{
  try{
    const book = await Book.findById(req.params.id).populate('author').exec() //populates author field with all author info
    res.render('books/show', {book: book})
  } catch{
    res.redirect('/')
  }
})

//edit book route
router.get('/:id/edit', async(req, res) =>{
  try{
    const book = await Book.findById(req.params.id) //only gives author id inside our book (we dont need anything else)
  renderEditPage(res, book)
  }catch{
    res.redirect('/')
  }
}) 

//delete book Page
router.delete('/:id', async(req, res) =>{
  let book
  try{
    book = await Book.findById(req.params.id)
    await book.deleteOne()
    res.redirect('/books')
  } catch{
    if (book != null){
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not delete book'
      })
    } else{
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, book, hasError = false){
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false){
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false){
  try{
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if (form === 'edit'){
        params.errorMessage = 'Error Editing Book'
      } else{
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
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