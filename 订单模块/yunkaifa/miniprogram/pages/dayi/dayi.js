Page({

  /**
   * 页面的初始数据
   */
  data: {
    //订单队列
    orderArr:"",
    start: 0
  },

  // getUserInfo: function(uid){
  //   const db = wx.cloud.database();
  //   const _ = db.command;
  //   return wx.cloud.callFunction({
  //     name: "joinSQL",
  //     data: {
  //       tables: ["UserInfo", "VolunteerInfo"],
  //       on: [[], "uid"],
  //       conds: {
  //         uid: _.eq(uid),
  //       }
  //     }
  //   })
  //   .then(res=>{
  //     return res;
  //   });
  // },

  getOrderData: function(uid, state, start, count){
    const db = wx.cloud.database();
    const _ = db.command;
    // var userinfo_query = this.getUserInfo(uid);
    var userinfo_query = wx.cloud.callFunction({
      name: "getUserInfo",
      data: {
        uid: uid
      }
    });
    console.log("********");
    console.log(userinfo_query);
    //若同一个uid获取到的条数大于1则在控制台报错，需要进行处理
    //TODO: 未来可以写入日志
    // if(userinfo_query.length>1){
    //   console.log("同一uid对应多条用户记录，请检查数据库！\n"+"记录为："+userinfo.toString()+"\n");
    //   // throw new Error("同一uid对应多条用户记录，请检查数据库！\n"+"记录为："+userinfo.toString()+"\n");
    // }
    var role = userinfo_query.role;
    var conds = {
      state: _.eq(state)
    }; 
    switch(role){
      case "志愿者":
        if(state == 0){
          var subjects = [];
          for(let vinfo in query_result[1].data){
            subjects.push(vinfo.sid);
          }
          conds.sid = _.in(subjects);
        }
        else{
          conds.auid = _.eq(uid);
        }
        break;
      case "用户":
        conds.puid = _.eq(uid);
        break;
      case "管理员":
        break;
      default:
        throw new Error("Illegal Role Type: "+role+"\n");
  }

    return wx.cloud.callFunction({
      name:"getOrderData",
      data:{
        uid: uid,
        state: state,
        start: start,
        count: count,
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //显示加载信息
    wx.showLoading({
      title: '正在查询订单',
    })
    //云函数查询订单队列数据
    this.getOrderData(0, 0, 0, 10)
    .then(res=>{
    this.setData({
      orderArr:res.result.data
    })
    console.log(this.data.orderArr);
    //关闭加载信息
    wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})