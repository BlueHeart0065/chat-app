const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const session = require('express-session');
const path = require('path');
const { log, error } = require('console');
const bcrypt = require('bcrypt');
const colors = require('colors');

const app = express();
const port = 3000;

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }))

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password : '',
    database : 'chat-database'
})

db.connect( err => {
    if(err){
        console.log('Database connection failed'.rainbow , err);
    }
    else{
        console.log('Database connected'.rainbow);
    }
})

//routes

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname , 'public')));
app.use(express.static(path.join(__dirname)));


app.get('/' , (req , res) => {
    res.render('login' , {errors : {} , email : '' , password : ''});
})

app.post('/' , async(req , res) => {
    const {email , password} = req.body;
    const errors = {};
    req.session.userEmail = email;
    const userEmail = req.session.userEmail;

    db.query('SELECT username FROM users WHERE email = ?', [userEmail] , (err , userNameResults) => {
        if(err){
            console.log('error in fetching username'.rainbow);
        }
        else{
            req.session.userName = userNameResults[0].username;
        }
    });

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
            console.log('error in fetching data form database'.rainbow, err);
        }
        else{
            if(!(results.length > 0)){
                const errors = {
                    invalidemail : true
                };
                console.log('reached'.cyan);
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
                res.redirect('/home');
                return;
            }
        }
    });

});

app.get('/signup' , (req , res) =>{
    res.render('signup' , {errors : {} , firstName : '' , lastName : '' , email : '' ,password : '' , confirmPassword: ''});
});

app.post('/signup' , async (req , res) => {
    const {firstName , lastName , email , password , confirmPassword} = req.body;
    const tag = getTag();

    db.query('SELECT * FROM users WHERE tag = ?', [tag] , (err , tagResults) => {
        if(err){
            console.log('error in fetching tag'.rainbow);
        }
        else{
            if(tagResults.length > 0){
                tag = getTag();
            }
        }
    })

    const errors = {};
    const hashPassword = await bcrypt.hash(password , 10);

    if(firstName == ''){
        const errors = {
            fnameisnull : true
        }
        return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});

    }

    if(lastName == ''){
        const errors = {
            lnameisnull : true
        }
        return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});

    }

    if(email == ''){
        const errors = {
            emailisnull : true
        }
        return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});

    }

    if(password == ''){
        const errors = {
            passisnull : true
        }
        return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});

    }

    if(password.length < 8){
        const errors = {
            passwordLength : true
        }
        return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});

    }

    if(confirmPassword == ''){
        const errors = {
            confirmisnull : true
        }
        return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});

    }

    if(confirmPassword != password){
        const errors = {
            notpasswordmatch : true
        }
        return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});

    }
        
    db.query('INSERT INTO users (username , email , password) VALUES (? ,?, ? ,?)' , [firstName+" "+lastName , email , hashPassword , tag] , async (err , results) => {
        if(err){
            console.log(' Data insertion error'.rainbow, err);
            const  errors = {
                emailexists : true
            };
            return res.render('signup' , {errors , email , firstName , password , confirmPassword , lastName});
        }
        else{
            console.log('Data inserted'.rainbow);
            return res.redirect('/signup/success');
        }
    });
    
});

app.get('/home' ,  async (req , res) => {

    const userEmail = req.session.userEmail;
    const userName = req.session.userName;
    res.render('home' , {userName, userEmail});
});

app.get('/signup/success' , (req , res) => {
    res.render('success');
})

app.post('/success' , (req , res) => {
    res.redirect('/');
})

app.listen(port, (req , res) => {
    console.log(`Server started on port ${port}`.rainbow)
});

function getTag(){
    const tag = ((Math.floor(Math.random()*9) + 1)*1000) + ((Math.floor(Math.random()*9)+1)*100) + ((Math.floor(Math.random()*9)+1)*10) + (Math.floor(Math.random()*9)+1);
    return tag;
}