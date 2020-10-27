// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  var uid = event.uid;
  return db.collection("UserInfo")
  .where({
    uid: _.eq(uid)
  })
  .get()
  .then(res=>{
    console.log(res);
    return res;
  }
  )
}