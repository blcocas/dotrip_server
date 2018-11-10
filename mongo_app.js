const express = require('express');
const app = express();

var main = require('./mongo_main.js');
app.use('/',main);

app.listen(8888,(req,res)=>{
    console.log("SERVER connected!!!!");
})