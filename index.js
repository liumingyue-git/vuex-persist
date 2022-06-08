const persistData = function (option) {
    const _option = option
    // 存储数据
    const setItem = function (_option, state, module) {
      const key = 'vuex' + (module ? '-' + module : '')
      // return
      const data = JSON.parse(_option.storage.getItem(key))
      if (data) {
        // 不是第一次存储数据
        data.value = state
        _option.storage.setItem(key, JSON.stringify({ ...data }))
      } else {
        if (module) {
          _option.storage.setItem(
            key,
            JSON.stringify({ value: state, time: new Date().getTime(), key: module })
          )
        } else {
          _option.storage.setItem(key, JSON.stringify({ value: state, time: new Date().getTime() }))
        }
  
        // 把初始状态存下来
      }
    }
    // 存储数据
    const getItem = function (_option) {
      if (Array.isArray(_option.module) && _option.module.length) {
        let dataArr = []
        _option.module.forEach(_item => {
          let key = 'vuex' + '-' + _item
          const data = JSON.parse(_option.storage.getItem(key))
          // 如果设置过期时间 先判断是否超时
          if (data && _option.timeOut) {
            if (new Date() - data.time > _option.timeOut) {
              // 超时返回
              dataArr.push('timeOut')
            } else {
              // 未超时返回value
              dataArr.push(data)
            }
          } else {
            // 未设置超时 返回value
            let val = data ? data.value : ''
            dataArr.push(val)
          }
        })
        return dataArr
      } else {
        const item = JSON.parse(_option.storage.getItem(key))
        // 如果设置过期时间 先判断是否超时
        if (item && _option.timeOut) {
          if (new Date() - item.time > _option.timeOut) {
            // 超时返回
            return 'timeOut'
          } else {
            // 未超时返回value
            return item.value
          }
        } else {
          // 未设置超时 返回value
          return item ? item.value : ''
        }
      }
    }
    //清除数据
    const clearItem = function (_option, _item) {
      const key = 'vuex' + (_item ? '-' + _item : '')
      _option.storage.removeItem(key)
    }
    return function (store) {
      if (_option.storage) {
        // 记录初始值
        _option.storage.setItem('vuex-origin', JSON.stringify(store.state))
        // 切换storage类型后清空上一个storage类型缓存的旧数据
        let oldVal = []
        const storage = [localStorage, sessionStorage]
        storage.forEach(_item => {
          if (_option.storage !== _item) {
            oldVal = Object.keys(_item).filter(item => item.includes('vuex'))
            oldVal.forEach(item => {
              localStorage.removeItem(item)
            })
          }
        })
        // 保存state键的列表  用于module模块更后清除不必要的数据
        const keyList = Object.keys(store.state)
        let arr = keyList.filter(item => !_option.module.includes(item))
        arr.forEach(item => {
          Object.keys(localStorage).forEach(_item => {
            if (_item == 'vuex-' + item) {
              localStorage.removeItem(_item)
            }
          })
          Object.keys(sessionStorage).forEach(_item => {
            if (_item == 'vuex-' + item) {
              localStorage.removeItem(_item)
            }
          })
        })
        const data = getItem(_option)
        //  如果data是一个Array 即配置了module
        if (Array.isArray(data) && data.length) {
          const door = data.every(_item => {
            return _item !== 'timeOut' && _item !== ''
          })
          if (door) {
            const key = 'vuex-origin'
            const originData = JSON.parse(localStorage.getItem(key))
            data.forEach(_item => {
              originData[_item.key] = _item.value
            })
            store.replaceState(originData)
          } else {
            _option.module.forEach(_item => {
              clearItem(_option, _item)
            })
          }
        } else {
          switch (data) {
            case 'timeOut':
              // 超时清掉数据
              let originData = JSON.parse(_option.storage.getItem('vuex-origin'))
              store.replaceState(originData.value)
              clearItem(_option)
            case '':
              break
  
            default:
              store.replaceState(data)
          }
        }
      }
      store.subscribe((mutation, state) => {
        // 是否配置了模块化存储
        if (Array.isArray(_option.module) && _option.module.length) {
          _option.module.forEach(_item => {
            if (state[_item]) {
              setItem(_option, state[_item], _item)
            }
          })
        } else {
          setItem(_option, state)
        }
      })
    }
  }
  
  export default persistData
  