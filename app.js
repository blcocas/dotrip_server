/*-------------------------------------------------------------
SETTING
--------------------------------------------------------------*/
const express = require('express');
const app = express();
const morgan = require('morgan');

const session = require('express-session');
var FileStore = require('session-file-store')(session);
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store : new FileStore({path : './sessions/'})
}));

const auth = require('./routes/auth');
app.use('/auth',auth);

app.use(express.static('public')); //static파일 디렉토리

app.set('views','./views'); //templete파일 디렉토리
app.set('view engine','pug'); //어떤 templete엔진?

app.use(morgan('dev'));

app.locals.pretty = true; //html소스 이쁘게
/*--------------------------------------
MONGODB
--------------------------------------*/

/*-------------------------------------------------------------
ROUTER
--------------------------------------------------------------*/
app.get('/',function(req,res){
  res.render('root');
})

/*-------------------------------------------------------------
FUNCTION
--------------------------------------------------------------*/
/*-------------------------------------------------------------
SERVER
--------------------------------------------------------------*/
app.listen(3000, function(){
  console.log('Connected to 3000 port!');
})

module.exports = app;
