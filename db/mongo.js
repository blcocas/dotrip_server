const {MongoClient} = require('mongodb');


var user_cl;
var dot_cl;
var client = MongoClient.connect("mongodb+srv://root:ghdwo966@cluster0-b9ez3.mongodb.net/",{
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

module.exports = {
  user_cl : function(){
    return new Promise(function(resolve,reject){
      resolve(user_cl);
    })
    // return user_cl;
  },
  dot_cl : function(){
    return dot_cl;
  }
}
