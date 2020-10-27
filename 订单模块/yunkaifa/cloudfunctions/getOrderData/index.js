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
  state = checkNumber(state, 0);
  start = checkNumber(start, 0);
  count = checkNumber(count, 20);
  if((state == null) || (start == null) || (count == null)){
    return null;
  }
  return await db.collection(orderTableName).where(conds)
  .skip(start)
  .limit(count)
  .get()
  .then(res=>{
    return res;
  })
  .catch(err=>{
    console.log(err);
    return [];
  })
}

function checkNumber(val, val_default){
  if(!(val instanceof Number)){
    if(!(val instanceof String)){
      val = val_default;
    }
    else{
      val = Number(val);
    }
  }
  return val;
}
//查询时，志愿者和用户仅能看到自己相关的订单，管理员可以看到所有订单