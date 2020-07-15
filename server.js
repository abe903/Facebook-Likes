const path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();
var session = require('express-session');

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended : true}));

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mchin615@',
    database: 'app'
});

connection.connect(function(error){
    console.log('Database Connected!');
}); 

app.listen(3000, () => {
    console.log('Server is running at port 3000');
});



// ROUTES
app.get('/home',(req, res) => {
    let name = req.session.username;
    let userid = req.session.idnumber;
    let sql = "SELECT app.blogs_users.blogID, app.blogs.post,app.blogs.id, COUNT(*) AS 'users' FROM app.blogs_users JOIN app.blogs ON app.blogs_users.blogID = app.blogs.id GROUP BY app.blogs_users.blogID";
    connection.query(sql, (err, results) => {
      if(err) throw err;
      res.render('home', {
        posts: results,
        userid: userid,
        name: name
      });
    }); 
});

app.get('/',(req, res) => {
    res.render('login');
});

app.get('/register',(req, res) => {
    res.render('register');
});

app.post('/signup', (req, res) => {
    let data = {name: req.body.name, username: req.body.username, password: req.body.password};
    let sql = "INSERT INTO users SET ?";
    connection.query(sql, data,(err) => {
        if(err) throw err;
        res.redirect('/login');
    }); 
})

app.post('/signin', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    connection.query(sql,[username, password],(err, results) => {
      if(err) throw err;
      req.session.idnumber = results[0].id
      req.session.username = results[0].username
      res.redirect('/home');
    }); 
})

app.post('/blogpost/:id', (req, res) => {
    let data = {post:req.body.blogpost, creatorID:req.params.id}
    let sql = "INSERT INTO blogs SET ?";
    connection.query(sql, data,(err) => {
        if(err) throw err;
        res.redirect('/home');
    }); 
})

app.post('/addlike/:userid/foruser/:blogid', (req, res) => {
    let data = { userID: req.params.userid, blogID: req.params.blogid};
    let sql = "INSERT INTO blogs_users SET ?";
    connection.query(sql, data,(err) => {
      if(err) throw err;
      res.redirect('/home');
    }); 
});
