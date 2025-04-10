require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const sequelize = require('./util/database')
const User = require('./models/users')
const Recipe=require('./models/recipes')
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
app.use('/', userRoute)
app.use('/',recipeRoute)

Recipe.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Recipe, { constraints: true, onDelete: 'CASCADE' })
// sequelize.sync({alter:true})
sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("app is nrunning on ", process.env.API_URL);
    
        })
    }).catch(err => console.log(err))