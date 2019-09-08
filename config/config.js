
const util = require('wangct-server-util');

module.exports = {
  routes:[
    {
      path:'/',
      component:'Layout'
    }
  ],
  html:{template:util.resolve('public/index.html')},
  webpack:{
    devServer:{
      contentBase:util.resolve(),
    }
  }
};
