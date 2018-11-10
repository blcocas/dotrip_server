var express = require('express');
var router = express.Router();
const app = require('../app.js');

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/*-------------------------------------------------------------
ROUTER
--------------------------------------------------------------*/
//demo
router.get('/',function(req,res){
  if(req.session.user_id){
    var output = `
    <h1>LOGIN SUCCESS!</h1>
    <p>You Are ${req.session.user_id} ${req.session.name}</p>
    <a href='/auth/logout'/>LOGOUT</a>
    `;

    res.send(output);
  }
  else{
    var output = `
    <h1>LOGIN FAILED!</h1>
    <p>You Are ${req.session.user_id} ${req.session.name}</p>
    <a href='/auth/logout'/>LOGOUT</a>
    `;
    res.send(output);
  }
})

//login
router.get('/login',function(req,res){
  res.render('login',{now : req.session.name});
})
router.post('/login',function(req,res){
  var sess = req.session;
  //db_query-----------------
  var db_id = 'hongss94';
  var db_pass = '1234';
  var db_name = '이홍재';
  //--------------------------
  var id = req.body.id;
  var pass = req.body.pass;

  if(id === db_id && pass === db_pass){
    console.log('success');
    sess.name = db_name;
    sess.user_id = db_id; //user_id가 session key
    req.session.save(function(){
      res.redirect('.');
    })
  }
  else{
    console.log('fail');
    res.redirect('.');
  }
})

//logout
router.get('/logout',function(req,res){
  delete req.session.user_id
  delete req.session.name;
  req.session.save(function(){
    res.redirect('/auth/login');
  });
})

//signup
router.get('/signup',function(req,res){
  res.render('signup');
})
router.post('/signup',function(req,res){
  var name = req.body.name;
  var id = req.body.id;
  var pass= req.body.pass;
  var db_id = 'hongss94'; //db_query
  if(id != db_id){
    //dbinsert!-----------

    //--------------------
    res.send('success');
  }
  else{
    res.send('id dulpicated');
  }
})
/*-------------------------------------------------------------
FUNCTION
--------------------------------------------------------------*/


module.exports = router;
