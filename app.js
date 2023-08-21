const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const session = require('express-session');
const path = require('path');
const { log, error } = require('console');
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
    res.render('login' , {errors : {} , email : '' , password : ''});
})

app.post('/' , (req , res) => {
    const {email , password} = req.body;
    const errors = {};
    flag = true;

    if(email == ''){
        errors.emailisnull = true;
        flag = false;
    }

    if(flag == true){
        db.query('SELECT * FROM users WHERE email = ?' , [email] , async (err , results) => {
            if(err){
                console.log("email finding error" , err);
            }
            else{
                if(results.length == 0){
                    errors.invalidemail = true;
                    flag = false;
                    return;
                }

                if(password == ''){
                    errors.passisnull = true;
                    flag = false;
                }

                if(flag == true){
                    const users = results[0];
                    const match = await bcrypt.compare(password,users.password);
                    if(!match){
                        errors.invalidpassword = true;
                        flag = false;
                    }
                }

            }
        });
    }

    if(Object.keys(errors).length > 0){
        res.render('login' , {errors , email , password});
    }

    if(flag == true){
        return res.redirect('/home');
    }

})

app.get('/signup' , (req , res) =>{
    res.render('signup' , {errors : {} , firstName : '' , lastName : '' , email : '' ,password : '' , confirmPassword: ''});
})

app.post('/signup' , async (req , res) => {
    const {firstName , lastName , email , password , confirmPassword} = req.body;
    const errors = {};
    const hashPassword = await bcrypt.hash(password , 10);

    flag = true;

    if(firstName == ''){
        errors.fnameisnull = true;
        flag = false;
    }

    if(lastName == ''){
        errors.lnameisnull = true;
        flag = false;
    }

    if(email == ''){
        errors.emailisnull = true;
        flag = false;
    }

    if(password == ''){
        errors.passisnull = true;
        flag = false;
    }

    if(password.length < 8 && flag == true){
        errors.passwordLength = true;
        flag = false;
    }

    if(confirmPassword == ''){
        errors.confirmisnull = true;
        flag =false;
    }

    if(confirmPassword != password && flag == true){
        errors.notpasswordmatch = true;
        flag = false;
    }

    if(Object.keys(errors).length > 0){
       return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});
    }



    if(flag == true){

        db.query('INSERT INTO users (username , email , password) VALUES (? ,?, ?)' , [firstName+" "+lastName , email , hashPassword] , async (err , results) => {
            if(err){
                console.log(' Data insertion error' , err);
            }
            else{
    
                console.log('Data inserted');
                res.redirect('/');
            }
        });
    }
    
})

app.get('/home' , (req , res) => {
    res.render('home');
})

app.listen(port, (req , res) => {
    console.log(`Server started on port ${port}`)
})