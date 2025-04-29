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
const RecipeCollection = require('./models/recipeCollection')
const DeletedRecipes=require('./models/adminDeletedRec')
const userRoute = require('./routes/userRouter')
const recipeRoute = require('./routes/recipeRoute')
const collectionRoute = require('./routes/collectionRoute')
const adminRoute=require('./routes/adminRoute')
const path = require('path')
const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
}); 

app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname,'views','login.html'))
})

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'))
})
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profilepage.html'))
})
app.get('/edit-profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'editProfile.html'))
})
app.get('/share-recipe', (req, res) => {
    res.sendFile(path.join(__dirname,'views','shareRecipe.html'))
})
app.get('/myrecipes', (req, res) => { 
    res.sendFile(path.join(__dirname,'views','myrecipes.html'))
})
app.get('/search', (req, res) => { 
    res.sendFile(path.join(__dirname,'views','search.html'))
})
app.get('/search-results', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'searchResults.html'))
})
app.get('/recipes/:recipeId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'recipe.html'))
})
app.get('/authors', (req, res) => {
    res.sendFile(path.join(__dirname,'views',"authors.html"))
})
app.get('/create-collection', (req, res) => {
    res.sendFile(path.join(__dirname,'views','createCollection.html'))
})
app.get('/mycollections', (req, res) => {
    res.sendFile(path.join(__dirname,"views",'mycollections.html'))
})
app.get('/activity-feed', (req, res) => {
    res.sendFile(path.join(__dirname, "views", 'activityfeed.html'))
})
app.get('/author/:authorId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'author.html'))
})
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, "views", 'admin.html'))
})
app.get('/admin/recipes/:recipeId', (req, res) => {
    res.sendFile(path.join(__dirname,'views','recipe.html'))
})
app.get('/admin/allusers', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'authors.html'))
})
app.get('/admin/author/:authorId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'author.html'))
})
app.get('/admin-creds', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admincreds.html'))
})
app.get('/admin/admin-creds', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admincreds.html'))
})

app.use('/', userRoute)
app.use('/', recipeRoute)
app.use('/', collectionRoute)
app.use('/',adminRoute)

Recipe.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Recipe, { constraints: true, onDelete: 'CASCADE' })
User.belongsToMany(Collection, { through: Usercollection })
Collection.belongsToMany(User, { through: Usercollection })
Recipe.belongsToMany(Collection, { through: RecipeCollection })
Collection.belongsToMany(Recipe, { through: RecipeCollection })
// sequelize.sync({alter:true})
sequelize.sync()
    try {
         app.listen(process.env.PORT || 5000, () => {
            console.log("app is nrunning on ", process.env.API_URL);
    
        })
    } catch (err) {
        console.log("error loading website ",err);
        
    }