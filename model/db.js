/*
* @Author: duqinzhi
* @Date:   2018-04-10 17:46:22
* @Last Modified by:   duqinzhi
* @Last Modified time: 2018-04-28 10:22:13
*/
/*
	把常用的增删改查，都封装成为module。向外暴露  
	内部核心的总结   每个都要连接数据库，每次一完就要关闭数据库  然后在回调里面写核心代码
	
	0.内部创建连接数据库
		MongoClient.connect(url,function(err,db){连接成功的回调})
	
	1.增加(insertOne)   db.collection(collectionName).insertOne(json,function(err,results){插入成功的回调})
	
	2.查找(find) 
		不同参数分类，写出args(翻页的参数pageamount :一页显示多少个，page:第几页)
		查找符合条件的数据
			var cursor = db.collection(collectionName).find(json).skip(skipNumber).limit(limitNumber).sort(sort)
 		符合条件数据遍历加到返回数组中
 			cursor.each(function(err,doc){
 				if(err)
				if(doc != null){
					push进去
				}else{
					数组回调返回
				}
 			})

 	3.删除(deleteMany) db.collection(collectionName).deleteMany(json,function(err,results{删除成功之后的回调}))
	
	4.修改(updataMany) db.conllection(collectionName).updataMany(json1,json2,function(err,results){修改成功之后的回调}
 */

//0.引包
var MongoClient = require("mongodb").MongoClient;
var settings = require("../settings.js");

//1.内部创建一个数据库连接模块(默认连接到YJF数据库)
function _connectDB(callback){
	var url =settings.dburl;
	//连接数据库
	MongoClient.connect(url,function(err,db){
		//连接后做的事情
		if(err){
			console.log("连接数据库失败");
			callback(err,null);
			return;
		}
		console.log("连接数据库成功");
		//连接成功之后干的事情传递给回调 
		callback(err,db);
	});
}
//测试_connectDB();
 
init();       //当外部引用这个db包的时候们就会自动调用
function init(){    
	_connectDB(function(err,db){      
		if(err){
			res.send(err);
			return; 
		}
		//users和username分别是集合名字  ，和索引名字    1代表的索引正序   -1代表索引负序
		db.collection("users").createIndex({"username":1},null,function(err,result){    
			if(err){
				res.send(err);
				return;
			}
			console.log("索引建立成功");
		})
	});
}


//2.外部暴露插入数据
	
exports.insertOne = function(collectionName,json,callback){
	_connectDB(function(err,db){
		//连接成功之后干的事情，即插入数据
		db.collection(collectionName).insertOne(json,function(err,results){
			//插入成功之后干的事情交给回调
			callback(err,results);
			db.close();   //关闭数据库
		})
	})
}

//3.查找数据，找到所有的数据,args是对象关于翻页的("pageamount":10,"page":10)

exports.find = function(collectionName,json,C,D){
	var result = [];  //把找到符合条件的放在数组最终返回，这样就不用查找一个返回一个
	if(arguments.length == 3){    //没有传递翻页的参数
		var callback = C;
		var skipNumber = 0;   //略过的数目
		var limitNumber = 0;  //每页显示的数目
	}else if(arguments.length == 4){
		var callback = D;
		var args = C;  //args是关于翻页的对象
		var skipNumber = args.pageamount * args.page || 0;  //略的数目
		var limitNumber = args.pageamount;
		var sort = args.sort || {};   //排序方式
	}else{
		throw new Error("find函数的参数为3个或者4个");
	}

	//连接数据库，连接之后查找所有
	_connectDB(function(err,db){
		//按要求找出来要求的页数，略过的数目，排序后的数据
		var cursor = db.collection(collectionName).find(json).skip(skipNumber).limit(limitNumber).sort(sort);
		//找到的遍历添加到数组里面，然后回调返回
		cursor.each(function(err,doc){
			if(err){
				callback(err,null);
				db.close();  //关闭数据库
				return;
			}

			if(doc != null){
				result.push(doc); //放入结果数组中
			}else{
				//遍历结束了，回调返回数组
				callback(null,result);
				db.close();
			}
		})
	})
}



//4.删除
exports.deleteMany = function(collectionName,json,callback){
	//连接数据库
	_connectDB(function(err,db){
		db.collection(collectionName).deleteMany(json,function(err,results){
			//删除成功之后干的事,交给回调，关闭数据库
			callback(err,results);
			db.close();
		})
	})
}

//5.修改
exports.updateMany = function (collectionName, json1, json2, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).updateMany(
            json1,//准备要修改的数据
            json2,//修改成什么样子
            function (err, results) {//修改成功之后的回调
                callback(err, results);
                db.close();
            });
    })
}


exports.getAllCount = function (collectionName,callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).count({}).then(function(count) {
            callback(count);
            db.close();
        });
    })
}