var mongodb = require('mongodb').Db;
var settings = require('../settings');
var crypto = require('crypto');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
  var md5 = crypto.createHash('md5'),
      email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
      head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
  //要存入数据库的用户信息文档
  var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      head: head
  };
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);//错误，返回 err 信息
      }
      //将用户数据插入 users 集合
      collection.insert(user, {
        safe: true
      }, function (err, user) {
        db.close();
        if (err) {
          return callback(err);
        }
        callback(null, user[0]);//成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

//读取用户信息
User.get = function(name, callback) {
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);//错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function (err, user) {
        db.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null, user);//成功！返回查询的用户信息
      });
    });
  });
};

User.getAll = function(callback) {
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      //返回只包含 name、id、email 属性的文档组成的存档数组
      collection.find({}, {
        "name": 1,
        "email": 1,
        "id": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        db.close();
        if (err) {
          return callback(err);
        }
        callback(null, docs);
      });
    });
  });
};

User.edit = function(name, callback) {
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "name": name
      }, function (err, doc) {
        db.close();
        if (err) {
          return callback(err);
        }
        callback(null, doc);//返回查询的一篇文章（markdown 格式）
      });
    });
  });
};

//更新用户其相关信息
User.update = function(name, email, callback) {
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      //更新用户信息
      collection.update({
        "name": name
      }, {
        $set: {email: email}
      }, function (err) {
        db.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

User.remove = function(name, callback) {
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      //查询要删除的文档
      collection.findOne({
        "name": name
      }, function (err, doc) {
        if (err) {
          db.close();
          return callback(err);
        }
        //删除转载来的文章所在的文档
        collection.remove({
          "name": name
        }, {
          w: 1
        }, function (err) {
          db.close();
          if (err) {
            return callback(err);
          }
          callback(null);
        });
      });
    });
  });
};