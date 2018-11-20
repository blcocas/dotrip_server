var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
    extended : false
}));

router.use(bodyParser.json());

//디비 연결
const {MongoClient} = require('mongodb');
var db;
var cl;


MongoClient.connect("mongodb+srv://root:ghdwo966@cluster0-b9ez3.mongodb.net/",
    {      
        useNewUrlParser : true},(err,client)=>{
        if(!err){
            console.log("MongoDB Connected.");
            db = client.db("UserList"); // select DB
            cl = collection = db.collection('UserList'); // select Collection
    }
})

//메인페이지
router.get('/',(req,res)=>{
        cl = collection = db.collection('UserList'); // select Collection
        cl.count({},(err,cnt)=>{
            dbNum = cnt;
         });
         //DB에 저장된 UserList 정보들 호출
         cl.find({}).toArray(function(err,result){
            var htmlMid = "";
            for(var i=0; i<dbNum; i++){
                var htmlTemp=`
                <div style=" font: italic bold 1.1em/1em Georgia, serif ;">
                id:${result[i].id}, password:${result[i].password} , name:${result[i].name} , _id:${result[i]._id}
                </div>
                 `;
                htmlMid = htmlMid + htmlTemp;
            }
            
            var htmlHead=`
            <html>
              <head></head>
              <body>
              <h1>로그인</h1>
               <p>
                <form action="/login" method="POST">
                  <label>ID:
                  <input type = "text" name = "id">
                  </label>
                  <label>PASSWORD:
                  <input type = "password" name = "password">
                  </label>
                  <input type = "submit" value = "Login">
                </form>
              </p>
              <h1>회원가입</h1>
              <form action="/signup" method="POST">
                  <label>ID:
                  <input type = "text" name = "id">
                  </label>
                  <label>PASSWORD:
                  <input type = "password" name = "password">
                  </label>
                  <label>NAME:
                  <input type = "text" name = "name">
                  </label>
                  <input type = "submit" value = "signup">
                </form>
                <h1>Dot 생성</h1>
                <form action="/dot" method="POST">
                  <label>도시이름:
                  <input type = "text" name = "mainCity">
                  </label>
                  <label>시작일:
                  <input type = "text" name = "inDay">
                  </label>
                  <label>종료일:
                  <input type = "text" name = "outDay">
                  </label>
                  <input type = "submit" value = "생성">
                </form>
              `;
           
            var htmlEnd =`</body>
                </html>
                `;    
        
            var html = htmlHead + `<h1>아이디 목록</h1>`+ htmlMid + htmlEnd ;
            res.send(html);
        })
})

//회원가입 페이지
router.post('/signup',(req,res)=>{
    cl = collection = db.collection('UserList'); // select Collection
    var ID = req.body.id;
    var PASSWORD = req.body.password;
    var NAME = req.body.name;

        collection.insertOne({id:ID, password:PASSWORD,name:NAME},(err,result)=>{
            console.log("inserted one document");
        })
    res.redirect('/');
})

//로그인페이지
router.post('/login',(req,res)=>{
    cl = collection = db.collection('UsertList'); // select Collection
    var ID = req.body.id;
    var PASSWORD = req.body.password;

    cl.findOne({id:ID, password:PASSWORD}, (err, result) => {
        if(result) {
            console.log(result);
        }
        else console.log("can't find");
    })
     res.redirect('/');
})

//Dot등록및생성
router.post('/dot',(req,res)=>{
    cl = collection = db.collection('dotList'); // select Collection
    var mainCity = req.body.mainCity;
    var inDay = req.body.inDay;
    var outDay = req.body.outDay;

    collection.insertOne({ mainCity:mainCity,inDay:inDay,outDay:outDay },(err,result)=>{
        console.log("Created dot");
    })
    //user의 dot배열에 방금생성한 dotId 추가..
    cl = collection = db.collection('UserList'); // select Collection

    res.redirect('/');
})


// user에 등록된 Dot정보 목록 show
router.get('/:id/:num',(req,res)=>{
    var userId = req.params.id;
    var num = req.params.num;
    var dotId;
    cl = collection = db.collection('UserList'); // select  UserList Collection

    cl.findOne({id:userId}, (err, result) => {
        if(result) {
            cl.find({}).toArray(function(err,result2){
                console.log("리스트1 :"+result2[0].dot[0]+" // 리스트2 :"+result2[0].dot[1]);
                dotId = result2[0].dot[0];
            })
            dotId = result.dot[num];
        }
        else console.log("can't find");

        //DB에 저장된 dot 정보들 호출
        cl = collection = db.collection('dotList'); // select  dotList Collection
        cl.findOne({id:dotId}, (err, result) => {
            console.log(dotId);
            if(result) {
                console.log("도시이름:"+" "+result.mainCity+"// 시작일:"+" "+result.inDay+"// 도착일:"+" "+result.outDay+"// 투두리스트: "+result.checkList[0].title);
            }
            else console.log("can't find");
        })
    })
    res.redirect('/');
})

module.exports = router;