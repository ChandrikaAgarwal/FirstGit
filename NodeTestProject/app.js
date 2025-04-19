require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const sequelize = require('./util/database')
const User = require('./models/users')
const Recipe = require('./models/recipes')
const Rating = require('./models/ratings')
const Collection = require('./models/collections')
const Usercollection = require('./models/userCollection')
const RecipeCollection=require('./models/recipeCollection')
const userRoute = require('./routes/userRouter')
const recipeRoute=require('./routes/recipeRoute')
const path = require('path')
const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))

app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname,'public','login.html'))
})

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'))
})
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profilepage.html'))
})
app.get('/edit-profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'editProfile.html'))
})
app.get('/share-recipe', (req, res) => {
    res.sendFile(path.join(__dirname,'public','shareRecipe.html'))
})
app.get('/myrecipes', (req, res) => { 
    res.sendFile(path.join(__dirname,'public','myrecipes.html'))
})
app.get('/search', (req, res) => { 
    res.sendFile(path.join(__dirname,'public','search.html'))
})
app.get('/search-results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'searchResults.html'))
})
app.get('/recipes/:recipeId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recipe.html'))
})
app.get('/authors', (req, res) => {
    res.sendFile(path.join(__dirname,'public',"authors.html"))
})
app.get('/create-collection', (req, res) => {
    res.sendFile(path.join(__dirname,'public','createCollection.html'))
})
app.get('/mycollections', (req, res) => {
    res.sendFile(path.join(__dirname,"public",'mycollections.html'))
})
app.get('/author/:authorId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'author.html'))
})
app.use('/', userRoute)
app.use('/',recipeRoute)

Recipe.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Recipe, { constraints: true, onDelete: 'CASCADE' })
User.belongsToMany(Collection, { through: Usercollection })
Collection.belongsToMany(User, { through: Usercollection })
Recipe.belongsToMany(Collection, { through: RecipeCollection })
Collection.belongsToMany(Recipe, { through: RecipeCollection })
// sequelize.sync({alter:true})
sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("app is nrunning on ", process.env.API_URL);
    
        })
    }).catch(err => console.log(err))