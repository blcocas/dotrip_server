var express = require('express');
var router = express.Router();
const app = require('../app.js');
app.use(require('connect-history-api-fallback')())

const fs = require("fs");
const json2xls = require("json2xls");
const path = require("path");

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


// dot 저장하기
router.post('/save',function(req,res){
  var dotList = req.body.dotList;
  var user_id =req.session.user_id;

  if(user_id){
    //원래 있던 데이타들 삭제

    find_dot_and_delete(user_id)
    .then(function(){
      delete_user_dot_list(user_id)})
    .then(function(){
      if(dotList.length == 0)
        res.json({success : 1, message : "삭제 성공"});
      insert_dot(dotList)
      .then(function(_id_list){
        console.log("insert_dot : "+_id_list)
        update_user_link(req,res,_id_list).then(function(success){
          res.json({success : success, message : "저장 1이면 성공, 0이면 실패"})
        });
      });
    })
  }
  else{
    res.json({success : 0, message : "로그인이 되어있지 않음"})
  }
})


// LoadOne
// 뷰에서 닷의 Num을 URL 파라미터로 받아서, 해당 닷의 넘버에 해당하는 닷정보를 보내준다.
router.get('/loadone/:num',function(req,res){
  var dotNum = req.params.num; // dot_num을 파라미터로 받음
  if(req.session.user_id){
    var id = req.session.user_id;
    user_cl.findOne({id : id},function(err,result){
      var dotId = result.dot_list[dotNum];
      dot_cl.findOne({_id : dotId},function(err,result){
      res.json({success :1, message :"dot하나 불러오기 성공", data : result});
      })
    })
  }
  else{
      res.json({success : 0, message : "로그인이 되어있지 않음"})
  }
});

// SaveOne
// 뷰에서 닷과 닷의 Num을 Post 받아서, 해당 닷의 넘버에 해당하는 닷객체를 업데이트 한다.
router.post('/saveone',function(req,res){
  var dotNum = req.body.num;
  var dot = req.body.dot;
  console.log(dot);
  if(req.session.user_id){
    var id = req.session.user_id;
    user_cl.findOne({id : id},function(err,result){
      var dotId = result.dot_list[dotNum];
      dot_cl.updateOne({_id : dotId},
        {
          $set :{
            checkList : dot.checkList
          }
        },
        function(err,result){
        res.json({success :1, message :"dot하나 저장 성공", data : result});
      })
    })
  }
  else{
    res.json({success : 0, message : "로그인이 되어있지 않음"})
  }
 });

 // 엑셀파일 저장.(체크리스트 안뜸..)
 router.use(json2xls.middleware); //res.xls 사용하기위해
 router.get("/excel", function(req, res) {
   if (req.session.user_id) {
     // 로그인한 아이디에 해당하는 dot리스트들을 가져옴.
     get_dot_list(req.session.user_id).then(function(list) {
       // dot중에서 가장 체크리스트가 큰값을 max변수에 저장.
       var max;
       for (let i = 0; i < list.length; i++) {
         if (!list[i].checkList) {
         } else {
           for (let j = 0; j < list[i].checkList.length; j++) {
             max = list[0].checkList.length;
             if (max < list[i].checkList.length) max = list[i].checkList.length;
           }
         }
       }
       // 엑셀에 표시할 체크리스트 동적으로 셋팅
       for(var i = 1; i <= max; i++)
       {
         list[0]['title'+i] = " ";
         list[0]['action'+i] = " ";
       }
       // 엑셀에서는 체크리스트가 표시되지 않으므로 표시되도록 작업.
       for (let i = 0; i < list.length; i++) {
         if (!list[i].checkList) { // .lenth에 대한 에러처리.
         } else {
           for (let j = 0; j < list[i].checkList.length; j++) {
             list[i]["title" + (j+1-'0')] = list[i].checkList[j].title;
             list[i]["action" + (j+1)] = list[i].checkList[j].action;
           }
         }
       }
       delete list[0].checkList;
       // 수정한 닷정보 리스트를 엑셀파일로 저장. 파일명은 아이디.xlsx
       res.xls(req.session.user_id+".xlsx", list);
     }).catch(()=>{
       res.redirect('http://localhost:8080/plan');
       // res.json({success : 0, message : "there is no dot"});
     });
   }
 });



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
//user의 dot list 삭제하기
function delete_user_dot_list(user_id){
  return new Promise(function(resolve,reject){
    user_cl.updateOne({id : user_id},
    {
      $set:{
        dot_list : []
      }
    },function(err,result){
      if(err) console.log(err);
      else{
        // console.log(result);
        resolve(1);
      }
    })
  })
}
//dot을 찾아서 삭제하기.
function find_dot_and_delete(user_id){
  return new Promise(function(resolve,reject){
    user_cl.findOne({id : user_id},function(err,result){
      var removeList = result.dot_list;
      for(i in removeList){
        dot_cl.remove({_id : removeList[i]});
      }
      resolve(1);
    })
  })
}
//dot collection에 insert한후 해당 _id_list 반환 (검증완료)
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

//user 클래스에 현재 로그인되어있는 아이디로 link하기 (검증완료)
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

function savexls(user_id) {
  return new Promise(function(resolve, reject) {
    user_cl.findOne({ id: user_id }, function(err, result) {
      if (err) console.log(err);
      else {
        console.log(result);
        resolve(result.name);
      }
    });
  });
}
module.exports = router;
