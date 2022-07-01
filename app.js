const express = require('express')
const path = require('path')
const routes = require('./routes/myRouter')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(cookieParser())
app.use(session({secret: 'mysecret', resave: false, saveUninitialized: false}))
app.use(express.urlencoded({extended: false}))
app.use(routes)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000,() => {
    console.log("Server is running on port 3000")
})