<template>
  <div id="app">
    <gnb />
    <top />
    <transition :name="transitionName" mode="out-in">
      <router-view class="routerView"/>
    </transition>
  </div>
</template>

<script>
const DEFAULT_TRANSITION = 'fade';

import Gnb from '@/components/gnb'
import Top from '@/components/Header'

export default {
  name: 'App',
  components: { Gnb, Top },
  data () {
    return {
      transitionName: DEFAULT_TRANSITION
    }
  },
  created () {
    this.$router.beforeEach((to, from, next) => {
        var transitionName;
        const toDepth = to.path.split('/').length;
        const fromDepth = from.path.split('/').length;
        transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left';

        this.transitionName = transitionName || DEFAULT_TRANSITION;

        next();
    });
  },
}
</script>

<style>
  .routerView {padding-bottom:50px}

  .fade-enter-active,
  .fade-leave-active {
      transition-duration: 0.3s;
      transition-property: opacity;
      transition-timing-function: ease;
  }

  .fade-enter,
  .fade-leave-active {
      opacity: 0!important
  }

  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
      transition-duration: 0.5s;
      transition-property: height, opacity, transform;
      transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
      overflow: hidden;
  }

  .slide-left-enter,
  .slide-right-leave-active {
      opacity: 0!important;
      transform: translate(2em, 0);
  }

  .slide-left-leave-active,
  .slide-right-enter {
      opacity: 0!important;
      transform: translate(-2em, 0);
  }
</style>
