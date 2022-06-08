## Install
``` 
npm install vuex-persist-data --save
```
## Use
``` javascript
import persistData from 'vuex-persist-data'

Vue.use(Vuex)
export default new Vuex.Store({
  modules: {
    userInfo,
    menu
  },
  plugins: [
    persistData({
      storage: window.localStorage, // 存储方式  localStorage 或者 sessionStorage       required   choose one for storage data
      timeOut: 30 * 60 * 1000, // 毫秒数       不是必须项                               not-required  setting millisecond  for  clear  Expired data
      module: ['userInfo'] // 需配置存储的模块  不配置默认存储全部    不是必须项           not-required  default for storage all data   setting this form storage module
    })
  ]
})

```