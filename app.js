const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const session = require('express-session');
const path = require('path');
const { log } = require('console');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : '',
    database : 'chat-database'
})

db.connect( err => {
    if(err){
        console.log('Database connection failed' , err);
    }
    else{
        console.log('Database connected');
    }
})

//routes

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('public')));


app.get('/' , (req , res) => {
    res.render('login');
})

app.get('/signup' , (req , res) =>{
    res.render('signup');
})

app.post('/signup' , async (req , res) => {
    const {firstName , lastName , email , password} = req.body;

    const hashPassword = await bcrypt.hash(password , 10);

    db.query('INSERT INTO users (username , email , password) VALUES (? ,?, ?)' , [firstName+" "+lastName , email , hashPassword] , async (err , results) => {
        if(err){
            console.log(' Data insertion error' , err);
        }
        else{
            console.log('Data inserted');
            res.redirect('/');
        }
    })
    
})

app.listen(port, (req , res) => {
    console.log(`Server started on port ${port}`)
})