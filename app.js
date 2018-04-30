/*
* @Author: duqinzhi
* @Date:   2018-04-27 07:33:28
* @Last Modified by:   duqinzhi
* @Last Modified time: 2018-04-30 13:12:28
*/
/**
 * 基本完成，就只剩下前端的校验没有写
 */


var express = require("express");
var app = express();
var db = require("./model/db.js");
var router = require("./router/router.js");
var mongodb = require("mongodb");

//socket公式
var http = require("http").Server(app);
var io = require("socket.io")(http);

//session公式
var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

//设置模板引擎
app.set("view engine","ejs");
//设置静态文件
app.use(express.static("./public"));

//中间件
app.get("/",router.showIndex);             //显示首页 
app.get("/login",router.showLogin);        //显示登录
app.get("/doLogin",router.doLogin);        //执行登录
app.get("/regist",router.showRegist);      //显示注册
app.get("/doRegist",router.doRegist);     //执行注册   
app.get("/chat",router.chat);              //聊天界面

//服务器监听连接
io.on("connection",function(socket){
	socket.on("chat",function(msg){
		//把接收到的msg原样广播 
		io.emit("chat",msg);
	});
});

//监听(socket 的时候  是http)
http.listen(1006);