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

app.post('/' , async(req , res) => {
    const {email , password} = req.body;
    const errors = {};

    if(email === ''){
        const errors = {
            emailisnull : true,
        }
        return res.render('login' , {errors , email , password});
    }

    if(password === ''){
        const errors = {
            passisnull : true,
        }
        return res.render('login' , {errors , email , password});
    }

    if(password == ''){
        errors.passisnull = true;
        flag = false;
    }

    db.query('SELECT * FROM users WHERE email = ?' , [email] , async(err , results) => {
        if(err){
            console.log('error in fetching data form database' , err);
        }
        else{
            if(!(results.length > 0)){
                const errors = {
                    invalidemail : true
                };
                console.log('reached');
                return res.render('login' , {errors , email , password});
            }
            else{
                const user = results[0];
                const match = await bcrypt.compare(password , user.password);
        
                if(!match){

                    const errors = {
                        invalidpass: true
                    }
                    return res.render('login' , {errors , email , password});
        
                }
        
                return res.redirect('/home');
            }
        }
    });

    
    // try{


            
    // }
    // catch(err){
    //     console.log('error in fetching data from database' , err);
    // }

});

app.get('/signup' , (req , res) =>{
    res.render('signup' , {errors : {} , firstName : '' , lastName : '' , email : '' ,password : '' , confirmPassword: ''});
});

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