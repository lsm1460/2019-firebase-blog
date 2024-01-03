// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import store from './store'
import 'es6-promise/auto'
import router from './router'
import VueSession from 'vue-session'
import firebase from 'firebase/app';
import Vuebar from 'vuebar';

var config = {
    apiKey: "AIzaSyCobOhfKVK9FQy_BxwCzK1sUpwLyEFDinw",
    authDomain: "sang-min.firebaseapp.com",
    databaseURL: "https://sang-min.firebaseio.com",
    projectId: "sang-min",
    storageBucket: "sang-min.appspot.com",
    messagingSenderId: "62328463850"
  };
firebase.initializeApp(config);

Vue.use(VueSession)
Vue.use(Vuebar)
Vue.config.productionTip = false

Vue.directive('click-outside', {
  bind: function(el, binding, vNode) {
    // Provided expression must evaluate to a function.
    if (typeof binding.value !== 'function') {
      const compName = vNode.context.name
      let warn = `[Vue-click-outside:] provided expression '${binding.expression}' is not a function, but has to be`
      if (compName) { warn += `Found in component '${compName}'` }
      
      console.warn(warn)
    }
    // Define Handler and cache it on the element
    const bubble = binding.modifiers.bubble
    const handler = (e) => {
      if (bubble || (!el.contains(e.target) && el !== e.target)) {
        binding.value(e)
      }
    }
    el.__vueClickOutside__ = handler

    // add Event Listeners
    document.addEventListener('click', handler)
  },
  
  unbind: function(el, binding) {
    // Remove Event Listeners
    document.removeEventListener('click', el.__vueClickOutside__)
    el.__vueClickOutside__ = null

  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
