Page({

  /**
   * 页面的初始数据
   */
  data: {
    //订单队列
    orderArr:"",
    start: 0
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
    wx.cloud.callFunction({
      name: "getOrderData",
      data: {
        //TODO: uid之后需要更换为微信号关联的的某个id
        uid: 0,
        state: 1,
        start: 0,
        count: 10
      }
    })
    .then(res=>{
      console.log(res);
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