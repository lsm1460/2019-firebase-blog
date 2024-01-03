import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/main'
import Intro from '@/components/intro'
import Cate from '@/components/cate'
import Login from '@/components/login'
import Write from '@/components/write'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Main',
      component: Main
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/write/:postId',
      name: 'Write',
      component: Write
    },
    {
      path: '/intro',
      name: 'Intro',
      component: Intro
    },
    {
      path: '/category/:tag/:pageNum/:postId',
      name: 'Cate',
      component: Cate,
      props: (route) => ({ search: route.search, addTag: route.addTag })
    }
  ]
})
