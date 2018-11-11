var express = require('express');
var router = express.Router();
const app = require('../app.js');

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const {MongoClient} = require('mongodb');
var cl;
MongoClient.connect("mongodb+srv://root:ghdwo966@cluster0-b9ez3.mongodb.net/dotrip",{
    useNewUrlParser : true},(err,client)=>{
      if(!err){
        console.log("MongoDB Connected.");
        db = client.db("dotrip"); // select DB
        cl = collection = db.collection('user'); // select Collection
      }
      else
        console.log(err);
})

/*-------------------------------------------------------------
ROUTER
--------------------------------------------------------------*/
//demo form-----------------------------------------------------
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
    <a href='/auth/login'/>LOGIN</a>
    `;
    res.send(output);
  }
})
//login
router.get('/login',function(req,res){
  res.render('login');
})
//signup
router.get('/signup',function(req,res){
  res.render('signup');
})
//--------------------------------------------------------------
//login
router.post('/login',function(req,res){

  var sess = req.session;
  var id = req.body.id;
  var pass = req.body.pass;
  var user = {};
  //db_query----------------------------
  cl.findOne({id:id , pass:pass},function(err,result){
    if(result == null) { //해당 아이디가 없거나 비밀번호가 틀림
      console.log('mongo_login failed');
      // res.redirect('.');
      res.json({success  :0, message : 'login failed'});
    }
    else if(id === result.id && pass === result.pass){
      console.log('mongo_login success');
      sess.name = result.name;
      sess.user_id = result.id; //user_id가 session key
      req.session.save(function(){
        // res.redirect('.');
        res.json({success : 1, message: 'login success'});
      })
    }
  })
})

//logout
router.get('/logout',function(req,res){
  delete req.session.user_id
  delete req.session.name;
  req.session.save(function(){
    // res.redirect('/auth/login');
    res.json({success : 1, message : 'logout success'});
  });
})

//signup
router.post('/signup',function(req,res){
  var name = req.body.name;
  var id = req.body.id;
  var pass= req.body.pass;
  var db_id = 'hongss94'; //db_query
  if(id != db_id){
    //dbinsert!-----------
    insert_user(name,id,pass);
    //--------------------
    res.json({success : 1, message : 'signup success'});
  }
  else{
    res.json({success : 0, message : 'signup failed'});
  }
})
/*-------------------------------------------------------------
FUNCTION
--------------------------------------------------------------*/
function insert_user(name,id,pass){
  cl.insertOne({name:name,id:id,pass:pass},function(err,result){
    if(err) console.log(err);
    else console.log('mongodb inserted success');
  })
}

module.exports = router;
