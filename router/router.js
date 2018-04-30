/*
* @Author: duqinzhi
* @Date:   2018-04-27 07:33:28
* @Last Modified by:   duqinzhi
* @Last Modified time: 2018-04-30 13:05:42
*/
var formidable = require("formidable");
var db = require("../model/db.js");



//显示首页
exports.showIndex = function(req,res,next){
	res.render("index");
};

//显示登录页面
exports.showLogin= function(req,res,next){
	res.render("login");
};

//执行登录页面
exports.doLogin= function(req,res,next){
	var username = req.query.username;
	var password =req.query.password;
	console.log(username,password);
	//根据用户名查找人
	db.find("chatroom",{"username":username},function(err,result){
		if(err){
			res.send("-5");                    //服务器错误
			return;
		}
		if(password == result[0].password){    //成功
			req.session.login = "1";
			req.session.username = username;
			res.send("1"); 
		}else{
			res.send("-1")//密码错误
			return;
		}
                      
	});
};

//显示注册页面
exports.showRegist = function(req,res,next){
	res.render("regist");
};

//执行注册页面
exports.doRegist = function(req,res,next){
	var username = req.query.username;
	var password = req.query.password;
	var tel = req.query.tel;
	console.log(username,password,tel);
	//判断昵称是否重复
	db.find("chatroom",{"username":username},function(err,result){
		if(err){
            res.send("-3");   //服务器错误
            return;
        }

		if(result.length!=0){
			res.send("-2");                 //用户名重复
		}
		//插入数据库
		db.insertOne("chatroom",{
			"username":username,
			"password":password,
			"tel":tel                 
		},function(err,result){
			if(err){
				res.send("-5");                    //服务器错误
				return;
			}
			console.log("插入成功");
            req.session.login = "1";
            req.session.username = username;             
            res.send("1");                       //成功
		});

	});
	
};


//显示聊天
exports.chat = function(req,res,next){
	if(!req.session.login){
		res.redirect("/");
		return;
	}
	res.render("chat",{
		"username":req.session.username
	});
}