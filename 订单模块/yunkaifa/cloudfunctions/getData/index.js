// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  db.collection("VolunteerInfo")
  .aggregate()
  .match({
    uid: _.eq(0)
  })
  .lookup({
    from: "Subject",
    localField: "sid",
    foreignField: "sid",
    as:"Subject"
  })
  .replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(["$Subject", 0]), '$$ROOT'])
  })
  .project({
    "Subject": 0
  })
  .lookup({
    from: "Class",
    localField: "cid",
    foreignField: "cid",
    as:"Class"
  })
  .replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(["$Class", 0]), '$$ROOT'])
  })
  .project({
    "Class": 0
  })
  .end()
  .then(res=>{console.log(res.list); return res.list;})
  .catch(err=>{console.log(err)});
}