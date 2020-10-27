// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

/**
 * 实现SQL的JOIN功能，以第一个table为主表，将其他表合并入主表
 * @author xcli
 * @method joinSQL
 * @for None
 * @param {Array} tables 进行join的table名称，要求大于1否则返回null
 * @param {Array} on 进行join的columns名称，第一个元素为Array，是主表join使用的columns，每个元素对应一个主表之后的table，若留空则认为每一次合并主表与副表使用列的列名相同；其他元素为String，每个元素对应一个副表，即该副表join使用的column
 * @param {Object} conds 对主表进行筛选的条件
 * @return {Object} 返回join结果
 * example: 
 * data: {
 *  tables: ["VolunteerInfo", "Subject", "Class"],
 *  on: [[], "sid", "cid"],
 *  // on: [["sid", "cid"], "sid", "cid"],
 *  conds: {
 *    uid: _.eq(0),
 *  }
 *}
 * 以VolunteerInfo为主表，执行如下操作：
 * 1. filter with conds；
 * 2. join "Subject" on column "sid"
 * 3. join "Class" on column "cid"
 * 4. return result
 */

exports.main = async (event, context) => {
  var {tables, on, conds} = event;
  if (!(tables instanceof Array) || (tables.length <= 1)){
    return null;
  }
  var mainCols = on[0];
  var query = db.collection(tables[0]).aggregate();
  if((conds instanceof Object) && (Object.keys(conds).length ===0)){
    query.match(conds);
  }
  if (mainCols.length == 0){
    for(let i=1; i<tables.length;i++){
      query.lookup({
        from: tables[i],
        localField: on[i],
        foreignField: on[i],
        as:"temp"
      })
      .replaceRoot({
        newRoot: $.mergeObjects([$.arrayElemAt(["$temp", 0]), '$$ROOT'])
      })
      .project({
        "temp": 0
      })
    }
  }
  else{
    for(let i=1; i<tables.length;i++){
      query.lookup({
        from: tables[i],
        localField: mainCols[i-1],
        foreignField: on[i],
        as:"temp"
      })
      .replaceRoot({
        newRoot: $.mergeObjects([$.arrayElemAt(["$temp", 0]), '$$ROOT'])
      })
      .project({
        "temp": 0
      })
    }
  }
  return await query.end()
  .then(res=>{
    console.log(res); 
    return res;
  })
  .catch(err=>{
    console.log(err)
    return null;
  });
}