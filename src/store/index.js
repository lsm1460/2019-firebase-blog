import Vue from 'vue'
import Vuex from 'vuex'
import config from './modules/config'
import editor from './modules/editor'
import ES6Promise from 'es6-promise'

ES6Promise.polyfill()
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    config, editor
  }
})
