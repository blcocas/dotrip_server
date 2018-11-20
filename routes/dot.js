// save와 load기능 로그인하면 dot목록을 불러오고  dot을 저장하는 기능까지.

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
//demo form-----------------------------------------------------


module.exports = router;