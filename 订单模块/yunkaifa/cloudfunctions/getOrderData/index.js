// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;
const orderTableName = "Order";

// 云函数入口函数
exports.main = async (event, context) => {
  //state, 0为未接单，1为已接单，2为已完成
  var {uid, state, start, count} = event;
  if((state == null) || (start == null) || (count == null)){
    return null;
  }
  return await db.collection("UserInfo")
  .where({
    uid: _.eq(uid)
  })
  .get()
  .then((res)=>{
    var userinfo_query = res.data;
    //若同一个uid获取到的条数大于1则在控制台报错，需要进行处理
    //TODO: 未来可以写入日志
    if(userinfo_query.length>1){
      console.log("同一uid对应多条用户记录，请检查数据库！\n"+"记录为："+userinfo.toString()+"\n");
      // throw new Error("同一uid对应多条用户记录，请检查数据库！\n"+"记录为："+userinfo.toString()+"\n");
    }
    var role = userinfo_query[0].role;
    var conds = {
      state: _.eq(state)
    }; 
    //查询时，志愿者和用户仅能看到自己相关的订单，管理员可以看到所有订单
    switch(role){
      case "志愿者":
        if(state == 0){
          return queryVolunteer0(uid, state, start, count, conds);
        }
        else{
          conds = _.or([{
            state: _.eq(state),
            puid: _.eq(uid)
          },
          {
            state: _.eq(state),
            auid: _.eq(uid)
          }])
        }
        break;
      case "用户":
        conds.puid = _.eq(uid);
        break;
      case "管理员":
        break;
      default:
        throw new Error("Illegal Role Type: "+role+"\n");
    };
    return queryOrderData(conds, start, count);
  })
}

// function checkNumber(val, val_default){
//   if(!(val instanceof Number)){
//     if(!(val instanceof String)){
//       val = val_default;
//     }
//     else{
//       val = Number(val);
//     }
//   }
//   return val;
// }

function queryVolunteer0(uid, state, start, count, conds){
  return db.collection("VolunteerInfo")
    .where({
      uid: _.eq(uid)
    })
    .get()
    .then(res=>{
      var subjects = [];
      for(let vinfo in res.data){
        subjects.push(vinfo.sid);
      }
      conds.sid = _.in(subjects);
      return queryOrderData(conds, start, count);
    })
}

function queryOrderData(conds, start, count){
  return db.collection(orderTableName)
  .aggregate()
  .match(conds)
  .skip(start)
  .limit(count)
  .lookup({
    from: "Subject",
    localField: "sid",
    foreignField: "sid",
    as:"temp"
  })
  .replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(["$temp", 0]), '$$ROOT'])
  })
  .project({
    "temp": 0
  })
  .lookup({
    from: "Class",
    localField: "cid",
    foreignField: "cid",
    as:"temp"
  })
  .replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(["$temp", 0]), '$$ROOT'])
  })
  .project({
    "temp": 0
  })
  .lookup({
    from: "UserInfo",
    localField: "puid",
    foreignField: "uid",
    as:"temp"
  })
  .replaceRoot({
    newRoot: $.mergeObjects([$.arrayElemAt(["$temp", 0]), '$$ROOT'])
  })
  .project({
    "temp": 0
  })
  .end()
  .then(res=>{
    // console.log(res); 
    return res;
  })
  .catch(err=>{
    // console.log(err);
    return null;
  });
}
