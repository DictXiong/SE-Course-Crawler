// pages/news/news.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var array = this.initData();
    this.setData({array:array});
    console.log(array);
  },
  initData: function () {
    var array = [];
    var object = new Object();
    object.img = "/images/news_icon.jpg";
    object.title = "标题标题";
    object.abstract = "摘要摘要摘要摘要摘要摘要摘要摘要摘要摘要摘要摘要";
    object.article = "这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容这是具体的文章内容";
    object.views = "浏览量";
    array[0] = object;
    array[1] = object;
    array[2] = object;
    array[3] = object;
    array[4] = object;
    array[5] = object;
    return array;
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