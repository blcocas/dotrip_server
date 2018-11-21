var express = require('express');
var router = express.Router();
const app = require('../app.js');

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const {MongoClient} = require('mongodb');
var cl;
MongoClient.connect("mongodb+srv://root:ghdwo966@cluster0-b9ez3.mongodb.net/",{
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
router.get('/load',function(req,res){
  console.log(req.session.user_id);
  if(req.session.user_id){
    find_user(req.session.user_id).then(function(user){
      res.json(user);
      // res.json(user.dot);
    }).catch(function(){
      res.json({sucess : 0, message : 'plz report error! /load'})
    })
  }
  else {
    res.json({success : 0, message : 'login required'});
  }
})
/*-------------------------------------------------------------
FUNCTION
--------------------------------------------------------------*/
function find_user(id){
  return new Promise(function(resolve,reject){
    cl.findOne({id : id},function(err,result){
      if(result == null){
        reject();
      }
      else{
        resolve(result);
      }
    })
  })
}
module.exports = router;
