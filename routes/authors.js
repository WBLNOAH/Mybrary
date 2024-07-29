const express = require('express')
const router = express.Router()
const Author = require('../models/author') //require the file inside of author model which allows us to create a new model (doesnt save to database just lets us create author)

//All authors route authors/
router.get('/', async (req, res) =>{
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== ''){
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try{
    const authors = await Author.find(searchOptions) //{} means we have no conditions to check for (get all authors)
    console.log(authors)
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
    // res.redirect(`authors/${newAuthor.id}`)
    res.redirect('authors')
  } catch {
    res.render('authors/new', {
      author: author,
      errorMessage: 'Error creating Author'
    })
  }
})

module.exports = router //this exports our router