const express = require('express')
const router = express.Router()
const Author = require('../models/author') //require the file inside of author model which allows us to create a new model (doesnt save to database just lets us create author)
const Book = require('../models/book')
//All authors route authors/
router.get('/', async (req, res) =>{
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== ''){
    searchOptions.name = new RegExp(req.query.name, 'i') //makes it so if we type jo or Ohn for John john appears
  }
  try{
    const authors = await Author.find(searchOptions) //{} means we have no conditions to check for (get all authors)
    res.render('authors/index', {
      authors: authors, 
      searchOptions: req.query
    })
  } catch{
    res.redirect('/')
  }
})

//New Author route  authors/new
router.get('/new', (req, res) =>{
  res.render('authors/new', { author: new Author() })
}) 

//Create author route   authors/
router.post('/', async(req, res) =>{
  const author = new Author({
    name: req.body.name
  })
  try{
    const newAuthor = await author.save()
    res.redirect(`authors/${newAuthor.id}`)
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

// router.get('/test', (req, res) =>{
//   // res.redirect('new')   if we dont add a / at the beginning we begin from our current path in this case authors/ and add new to it
//   res.redirect('/authors/new') //if we do add a / we begin from our start page localhost 3000:
// }) 

router.get('/:id', async(req, res) =>{
  try{
    const author = await Author.findById(req.params.id)
    const books = await Book.find({author: author.id}).limit(6).exec()
    res.render('authors/show', {
      author: author,
      booksByAuthor: books
    })
  }catch{
    res.redirect('/')
  }
})

router.get('/:id/edit', async(req, res) =>{
  try{
    const author = await Author.findById(req.params.id) //finds user by id if that exists 
    res.render('authors/edit', { author: author })
  } catch{
    res.redirect('/authors')
  }
})

router.put('/:id', async (req, res) =>{
  let author
  try{
    author = await Author.findById(req.params.id) //uses database to find the author by its id
    author.name = req.body.name //updates our authors name
    await author.save()
    res.redirect(`/authors/${author.id}`) //we redirect from current path
  } catch {
    if (author == null){
      res.redirect('/')
    }else{
      res.render('authors/edit', {
        author: author,
        errorMessage: 'Error updating Author'
      })
    }
  }
})

router.delete('/:id', async (req, res) =>{
  let author
  try{
    author = await Author.findById(req.params.id) //uses database to find the author by its id
    await author.deleteOne()
    res.redirect('/authors')
  } catch {
    if (author == null){
      res.redirect('/')
    } else {
      res.redirect(`/authors/${author.id}`)
    }
  }
})


module.exports = router //this exports our router