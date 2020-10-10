// pages/home/home.js
Page({

    //转发跳转 navigator
    navigatorBtn:function(){
      wx.navigateTo({/*保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。使用 wx.navigateBack 可以返回到原页面。小程序中页面栈最多十层*/
        url: '../navigator/navigator?title=redirect_2020',
        success:function(res){
          console.log(res)
        },
        fail:function(){},
        complete:function(){}
      })
    },
    redirectBtn:function(){
      wx.redirectTo({/*关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面。*/
        url: '../navigator/navigator?title=redirect_2020',
        success:function(res){
          console.log(res)
        },
        fail:function(){},
        complete:function(){}
      })
    },
    switchBtn:function(){
      wx.switchTab({/*跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面 */
        url: '../redirect/redirect?title=redirect_2020',
        success:function(res){
          console.log(res)
        },
        fail:function(){},
        complete:function(){}
      })
    }
    //重定向跳转 redirect
    //底部导航栏页面跳转 switchTab

})