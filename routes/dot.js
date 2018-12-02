var express = require('express');
var router = express.Router();
const app = require('../app.js');

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const {MongoClient} = require('mongodb');
var user_cl;
var dot_cl;
MongoClient.connect("mongodb+srv://root:ghdwo966@cluster0-b9ez3.mongodb.net/",{
    useNewUrlParser : true},(err,client)=>{
      if(!err){
        console.log("MongoDB Connected.");
        db = client.db("dotrip"); // select DB
        user_cl = db.collection('user'); // select Collection
        dot_cl = db.collection('dot');
      }
      else
        console.log(err);
})
/*-------------------------------------------------------------
ROUTER
--------------------------------------------------------------*/
//dot 불러오기
router.get('/load',function(req,res){
  console.log(req.session.user_id);
  if(req.session.user_id){
    get_dot_list(req.session.user_id).then(function(list){
      console.log(list);
      res.json({success : 1, message : "불러오기 성공", data : list})
    })
  }
  else{
    res.json({success : 0, message : "로그인이 되어있지 않음"})
  }
})

//dot 저장하기
router.post('/save',function(req,res){
  var dotList = req.body.dotList;
  if(req.session.user_id){
    insert_dot(dotList)
    .then(function(_id_list){
      console.log("insert_dot : "+_id_list)
      update_user_link(req,res,_id_list).then(function(success){
        res.json({success : success, message : "저장 1이면 성공, 0이면 실패"})
      });
    });
  }
  else{
    res.json({success : 0, message : "로그인이 되어있지 않음"})
  }
})
/*-------------------------------------------------------------
FUNCTION
--------------------------------------------------------------*/
//load--------------------------------------------------------------------------
//dot list를 반환해야함.
function get_dot_list(id){
  return new Promise(function(resolve,reject){
    user_cl.findOne({id : id},function(err,result){
      dot_cl.find({_id : {$in: result.dot_list}}).toArray(function(err,result){
        if(err) console.log(err);
        else {
          for(dot in result){
            delete result[dot]._id;
            // console.log(result[dot]);
          }
          // console.log(result);
          resolve(result);
        }
      })
    })
  })
}

//save--------------------------------------------------------------------------
//dot collection에 insert한후 해당 _id_list 반환
function insert_dot(dot_list){
  return new Promise(function(resolve,reject){
    // console.log(dot_list);
    dot_cl.insert(dot_list,function(err,result){
      if(err) console.log(err);
      else {
        console.log('mongodb inserted success');
        var _id_list = Object.keys(result.insertedIds).map(function(key) {
          return result.insertedIds[key];
        });
        resolve(_id_list);
      }
    })
  })
}

//user 클래스에 현재 로그인되어있는 아이디로 link하기
function update_user_link(req,res,_id_list){
  return new Promise(function(resolve,reject){
    user_cl.updateOne({id : req.session.user_id},
    {
      $set : {
        dot_list : _id_list
      }
    },function(err,result){
      resolve(1);
    })
  })

}
module.exports = router;
