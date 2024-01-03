<template>
  <header :class="[animation? 'animation': '', animationEnd? 'animationEnd' : '', config.writeMode? 'writeMode':'']">
    <p class="forEditor" v-if="config.writeMode">POST EDITOR</p>
    <div class="animationSection">
      <div class="headerInner">
        <img src="/static/images/bul01.png" alt="" border="0"/>
        <img src="/static/images/bul02.png" alt="" border="0"/>
        <img src="/static/images/bul03.png" alt="" border="0"/>
        <img src="/static/images/star.png" alt="" border="0"/>
        <img src="/static/images/star2.png" alt="" border="0"/>
        <router-link class="loginBox" :class="[!$session.exists()? 'active' : '']" v-bind:to="{ name:'Login' }">Login</router-link>
        <div class="loginBox" :class="[$session.exists()? 'active' : '']">
          <a href="javascript:blur()" @click="logout">Logout</a>
          <router-link v-bind:to="{ name:'Write', params:{postId:'new'} }">Write</router-link>
        </div>
      </div>
    </div>
    <div class="blogTitleArea">
      <div class="myProfileImage">
        <div class="speechBaloon" :class="[config.avatarSayActive? 'avatarSay':'']">
          <p>{{config.avatarSay}}</p>
        </div>
        <div @click="avatarSay">
          <img :src="'/static/images/face'+config.avatarFase+'.png'" alt="" border="0"/>
        </div>
      </div>
    </div>
    <div class="goTop" @click="goTop(0,1250)" :class="{active:goTopActive}">
      <p>TOP</p>
    </div>
  </header>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth'
import { mapState } from 'vuex'
import { setTimeout } from 'timers';
export default {
  name: 'Top',
  data () {
    return {
      animation: false,
      animationEnd: false,
      goTopActive:false,
      writeMode: this.$session.get('writeMode'),
      lastScrollTop:0
    }
  },
  computed: {
    ...mapState({
          config: state => state.config
      })
  },
  created () {
    setTimeout(() => {
      this.animation = true
    },1500);
    setTimeout(() => {
      this.animationEnd = true;
    },2000);
    setTimeout(() => {
      this.$store.dispatch('config/myAvatar_action', {face:1, say:'환영합니다!'});
    },2500);

    window.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    logout() {
      this.$session.destroy();
      firebase.auth().signOut().then(() => {
        this.$store.dispatch('config/myAvatar_action', {face:1, say:'로그아웃되었습니다.'});
        this.$router.push('/');
        location.reload();
      }).catch((error) => {
        console.log(error);
      });
    },
    avatarSay() {
      var ramdomNum = Math.random()
      var range = (Math.floor(ramdomNum*10)+1)-6;
      var resultNum = range;
      if(range < 0 && range > -5){resultNum = range * -1 }
      else {resultNum = 4}
      var converse = [
        '안녕하세요!',
        '그렇게 누르는건 좀..',
        '바로 달려갑니다!',
        '반갑습니다!'
      ]
      this.$store.dispatch('config/myAvatar_action', {face:resultNum, say:converse[resultNum-1]});
    },
    goTop(to, duration){
      var start = document.documentElement.scrollTop,
          change = to - start,
          currentTime = 0,
          increment = 20;

      Math.easeInOutQuad = function (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
      };

      var animateScroll = function(){
          currentTime += increment;
          var val = Math.easeInOutQuad(currentTime, start, change, duration);
          document.documentElement.scrollTop = val;
          if(currentTime < duration) {
              setTimeout(animateScroll, increment);
          }
      };

      animateScroll()
    },
    handleScroll(){
      var st = Math.floor(window.pageYOffset) || Math.floor(document.documentElement.scrollTop) // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
      if (st > this.lastScrollTop){
          // downscroll code
          this.goTopActive = false;
      } else {
          // upscroll code
          if(st < 500){
            this.goTopActive = false
          }else{
            this.goTopActive = true
          }
      }
      setTimeout(() => {
        this.lastScrollTop = st <= 0 ? 0 : st;
      },100)
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  header {padding-left:0; background-color:transparent; display: flex; flex-wrap: wrap; justify-content: center;}
  .forEditor {width:0}
  .animationSection {width:100%; height:100%; position:fixed; transition:.4s ease-out height; background-color:#493f55; top:0; left:0; z-index:1000}
  header.animation .animationSection {height:300px}
  header.animationEnd .animationSection {position:relative; z-index:998}
  header + div {opacity:0; transition: .2s all; transition-delay: .3s; position:relative; bottom:-10px; padding-top:20px}
  header.animationEnd + div { opacity:1; bottom:0}

  .headerInner {transition:.1s max-width; position:relative; margin:0 auto; max-width:100%; height:100%; overflow:hidden}
  .headerInner img {width:100%; position:absolute; left:0; transition:.4s all}
  .headerInner img:nth-child(-n+3) {animation: mymove .3s forwards; bottom:-500px; z-index:1}
  .headerInner img:nth-child(n+4) {top:0; opacity:0; animation: twinkleStar 5s infinite;}

  header.animation  .headerInner {max-width:1200px}
  .headerInner img:nth-child(2) {animation-delay: .3s;}
  .headerInner img:nth-child(3) {animation-delay: .8s;}
  .headerInner img:nth-child(5) {animation-delay: 1s;}

  .headerInner .loginBox {position:absolute; top:15px; right:15px; opacity:0; transition:.2s opacity; color:#fff; font-size:13px;; display:none; z-index:1}
  .headerInner .loginBox a {color:#fff; font-size:13px;}
  .headerInner .loginBox.active {display:block}
  header.animationEnd .headerInner .loginBox {opacity:1}

  @keyframes mymove {
      from {bottom: -500px;}
      to {bottom: 0px;}
  }

  @keyframes twinkleStar {
      0% {opacity: 0;}
      50% {opacity: 1;}
      100% {opacity: 0;}
  }

  header.animation  .headerInner img:nth-child(1) {transform:translateY(20%)}
  header.animation  .headerInner img:nth-child(2) {transform:translateY(12%)}
  header.animation  .headerInner img:nth-child(3) {transform:translateY(10%)}

  header.animation  .headerInner img:nth-child(5) {transform:translateY(-1%)}

  .blogTitleArea {position:relative; z-index:1; bottom:-100px; opacity:0; transition:.2s all; text-align:center; z-index:1001}
  header.animationEnd .blogTitleArea {opacity:1; bottom:0}

  .myProfileImage {max-width:430px; width:100%; padding:0 15px; margin:-50px auto 0; position:relative}
  .myProfileImage > .speechBaloon {position:absolute; top:0; opacity:0; transition:.3s all; transform:translateY(-100%) translateX(-50%); background-color:#fff; border-radius:10px; box-shadow:5px 5px 15px rgba(0,0,0,.2); padding:3px 15px 5px; left:50%}
  .myProfileImage > .speechBaloon.avatarSay {top:-20px; opacity:1}
  .myProfileImage > div:last-child {width:100px; height:100px; background-color:#222; border:3px solid #fff; border-radius:50%; overflow:hidden; margin:0 auto; cursor:pointer}
  .myProfileImage > .speechBaloon p {white-space: nowrap}
  .myProfileImage img {display:block; width:100%}

  header.writeMode {padding-left:25px; background-color:#493f55; align-items: center; margin-bottom:0}
  header.writeMode .forEditor {width:150px; color:#fff; font-size:18px}
  header.writeMode .animationSection {height:55px!important; width:calc(100% - 265px)}
  header.writeMode .animationSection img {display:none; transform: scale(0)}

  header.writeMode .myProfileImage {max-width:90px; margin: 0 auto -20px;}
  header.writeMode .myProfileImage > div:last-child {width:60px; height:60px}
  header.writeMode.animation .headerInner {max-width:100%}

  header.writeMode + div, header.writeMode .animationSection, header.writeMode .blogTitleArea, header.writeMode .headerInner  {transition:none; opacity:1}
  header.writeMode .animationSection {position:relative}
  header.writeMode + div { opacity:1; bottom:0}
  header.writeMode .blogTitleArea {bottom:0}

  header.writeMode .myProfileImage > .speechBaloon {transform:translateY(100%); left:auto; right:15px; top:auto; bottom:0}
  header.writeMode .myProfileImage > .speechBaloon.avatarSay {bottom:-20px; opacity:1}

  .goTop {position:fixed; top:-200px; left:0; right:0; opacity:0; transition:.2s all; background-color:#493f54; z-index:1002; cursor:pointer}
  .goTop.active {top:0; opacity:.6}
  .goTop.active:hover {opacity:1}
  .goTop p {text-align:center; color:#fff; font-size: 15px; padding: 7px 0;}

  @media screen and (max-width:900px){
    header.animation .animationSection {height:230px}
  }

  @media screen and (max-width:760px){
    header.animation .animationSection {height:180px}
  }

   @media screen and (max-width:500px){
    header.animation .animationSection {height:150px}
  }
</style>
