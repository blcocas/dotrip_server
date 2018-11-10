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

MongoClient.connect("mongodb://localhost:27017",
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
        cl.count({},(err,cnt)=>{
            dbNum = cnt;
         });

         cl.find({}).toArray(function(err,result){
            var htmlMid = "";
            for(var i=0; i<dbNum; i++){
                var htmlTemp=`
                <div style=" font: italic bold 1.1em/1em Georgia, serif ;">
                id:${result[i].id}, password:${result[i].password} , name:${result[i].name}
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

module.exports = router;