<template>
  <nav :class="[config.navBoolean? 'navOpen': '', config.navSize? 'navSmall' : '']"  @mouseleave="navClose">
    <div class="navCloseBtnWrp">
      <div class="gnbLock" @click="navLocker" :class="{active:config.navLock}"><div class="cateIcon"></div></div>
      <div class="gnbClose" @click="gnbToggle">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="listWrp" @mouseover="navOpen">
      <ul>
        <li v-for="(data , index) in config.navList" :key="index" :class="[data.active?'active':'', data.ani? 'liSmall' : '', data.aniR? 'liOrigin' : '', data.name == 'Cate'? 'forCate' : '']" @click="activeMenu(index, data.name, $event)">
          <router-link v-if="data.name != 'Cate'" v-bind:to="{ name:data.name }"><div class="cateIcon" :class="data.image+'_icon'"></div><span>{{data.text}}</span></router-link>
          <a v-if="data.name == 'Cate'" href="javascript:blur()"><div class="cateIcon" :class="data.image+'_icon'"></div><span>{{data.text}}</span></a>
          <div class="noClose tagList" v-if="data.name == 'Cate'" :class="[tagsListOpn? 'listOpn' : '']">
            <div class="noClose">
              <div v-bar class="noClose">
                <div class="noClose">
                  <ul class="noClose tags">
                    <li class="noClose tagL"><router-link :to="{name:data.name, params:{tag:'ALL', pageNum:1, postId:'board'}}">#ALL</router-link></li>
                    <li class="noClose tagL" v-for="(tag, index) in config.tags" :key="index"><router-link :to="{name:data.name, params:{tag:tag, pageNum:1, postId:'board'}}">#{{tag}}</router-link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/database'
import { mapState } from 'vuex'

export default {
  name: 'Gnb',
  data () {
    return {
      gnbCompute: false,
      tags: [],
      tagsListOpn: false,
      mouseBtnDwn: false
    }
  },
  computed: {
    ...mapState({
          config: state => state.config
      })
  },
  created(){
    this.$store.dispatch('config/tagListLoad_action');
    window.addEventListener('mousedown',this.mouseCheckDown)
    window.addEventListener('mouseup',this.mouseCheckUp)
  },
  mounted() {
    this.config.navList.forEach((page, index) => {
      if(page.name == this.config.nowPage){
        page.active = true
      }else{
        page.active = false
      }
    });
  },
  methods: {
    mouseCheckDown(){
      this.mouseBtnDwn = true;
    },
    mouseCheckUp(){
      this.mouseBtnDwn = false;
    },
    gnbToggle () {
      if(this.config.gnbState){
        this.$store.dispatch('config/gnbToggle_action', 'open');
      }else{
        this.$store.dispatch('config/gnbToggle_action', 'close');
      }
    },
    navOpen () {
      if(!this.config.navLock){
        this.config.navBoolean = true
      }
    },
    navClose () {
      if(!this.mouseBtnDwn){
        if(!this.config.navLock){
          this.config.navBoolean = false
        }
        this.tagsListOpn = false
      }
    },
    activeMenu (index, name, event) {
      this.config.navList.forEach((item) => {
        item.active = false
      });
      this.config.navList[index].active = true;
      if(name == 'Cate'){
        if(event.target.classList[0] == 'noClose' || event.target.classList[0] == 'vb-dragger' || event.target.classList[0] == 'vb'){
          
        }else{
          this.tagsListOpn = !this.tagsListOpn
        }
      }
    },
    navLocker() {
      this.config.navLock = !this.config.navLock
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  nav {display:inline-block; padding:9px 9px 12px; background-color:#4d4259; border-radius:24px; transition:.2s all; transition-delay: .1s; width:49px; max-width:49px; position:fixed; bottom:15px; left:15px; z-index:999; max-height:200px}
  nav.navOpen {width:138px; max-width:138px}
  
  nav .cateIcon {background-image:url('/static/images/cateIcon.png'); background-repeat: no-repeat}
  nav .listWrp .cateIcon {width:31px; height:21px}
  nav .listWrp .home_icon {background-position:0 0}
  nav .listWrp .intro_icon {background-position:0 -21px}
  nav .listWrp .cate_icon {background-position:0 -42px}

  nav li {padding:5px; margin-bottom:8px; background-color:#4d4258; transition:.2s ease background-color; border-radius:15.5px; height:31px;}
  nav li.active, nav li:hover {background-color:#30273a}
  nav li a {display:flex; width:100%; align-items:flex-start; height:21px}
  nav li:last-child {margin-bottom:0}

  nav li span {width:0; opacity:0; overflow:hidden; display:block; transition:.2s all; color:#fff}
  nav.navOpen li span {width:calc(100% - 21px); height:auto; opacity:1; font-size:13px; display:flex}

  .navCloseBtnWrp {margin-bottom:10px; height:28px; width:100%; position:relative; padding-left:3px; transition:.2s width}

  .navCloseBtnWrp > .gnbClose {width:28px; height:28px; border-radius:50%; background-color:#fff; transition:.1s all; position:absolute; top:50%; right:1px; cursor:pointer; transition-delay: .2s; transform: translateY(-50%)}
  nav.navOpen .navCloseBtnWrp > .gnbClose {width:20px; height:20px}
  
  .navCloseBtnWrp > .gnbClose > div {width:20px; height:1px; transition:.2s all; transition-delay: .3s; position:absolute; top:50%; left:50%; background-color:#4d4259}
  nav.navOpen .navCloseBtnWrp > .gnbClose > div {width:15px}

  .navCloseBtnWrp > .gnbClose > div:nth-child(1) {transform:translate(-50%, -50%) rotate(45deg)}
  .navCloseBtnWrp > .gnbClose > div:nth-child(2) {transform:translate(-50%, -50%) rotate(-45deg)}
  .navCloseBtnWrp > .gnbClose > div:nth-child(3) {transform:translate(-50%, -50%) rotate(-45deg)}

  .gnbLock {width:22px; height:22px; opacity:0; pointer-events: none; position:relative; border-radius: 50%; cursor: pointer;}
  .gnbLock > div {position:absolute; width:8px; height:11px; left:50%; top:50%; margin:-5.5px 0 0 -4.5px; background-position:-0 -63px}
  nav.navOpen .gnbLock {opacity:.5; pointer-events: all}
  nav.navOpen .gnbLock:hover {opacity:1}
  nav.navOpen .gnbLock.active {background-color:#30273a;}
  nav.navOpen .gnbLock.active > div {background-position:-8px -63px}

  nav li.liSmall {animation:liSmall .2s ease-out forwards}
  nav li.liOrigin {animation:liOrigin .2s ease-out forwards}

  nav.navSmall {max-height: 36px; max-width:36px;  padding:4px; background-color:#70647d}
  nav.navSmall .navCloseBtnWrp {width:28px}
  nav.navSmall .navCloseBtnWrp > .gnbClose {right:0}

  nav.navSmall .navCloseBtnWrp > .gnbClose > div {height:2px; transition-delay:0s}
  nav.navSmall .navCloseBtnWrp > .gnbClose > div:nth-child(1) {transform:translate(-50%, -50%) rotate(0deg); top:35%}
  nav.navSmall .navCloseBtnWrp > .gnbClose > div:nth-child(2) {transform:translate(-50%, -50%) rotate(0deg)}
  nav.navSmall .navCloseBtnWrp > .gnbClose > div:nth-child(3) {transform:translate(-50%, -50%) rotate(0deg); top:65%}

  nav.navSmall:hover .navCloseBtnWrp > .gnbClose > div:nth-child(1) {transform:translate(-80%, -50%) rotate(-45deg); top:45%; width:15px}
  nav.navSmall:hover .navCloseBtnWrp > .gnbClose > div:nth-child(2)  {transform:translate(-20%, -50%) rotate(45deg); top:45%; width:15px}
  nav.navSmall:hover .navCloseBtnWrp > .gnbClose > div:nth-child(3) {opacity:0}

  .forCate {position:relative}
  .tagList {position:absolute; bottom:0; transition:.2s all; transform:translateX(100%); padding-left:10px; opacity:0; right:20px; pointer-events: none}
  .tagList.listOpn {right:-5px; opacity:1; pointer-events: all}
  .tagList > div {background-color:#4d4259; padding:7px 0 8px 5px; border-radius:10px}
  .tagList > div > div {height:120px}
  .tagList ul {padding-right:12px}
  nav .tagList li {font-size: 12px; height: auto; padding: 0; margin-bottom: 3px; padding:3px 8px; border-radius: 6px}
  nav .tagList li a {color:#fff; display:block}

  @keyframes liSmall {
    from {
      transform:scale(1)
    }
    to {
      transform:scale(0)
    }
  }

  @keyframes liOrigin {
    from {
      transform:scale(0)
    }
    to {
      transform:scale(1)
    }
  }

  @media screen and (max-width:600px){
    nav {bottom:-10px; left:0; padding:4px 9px 2px; border-radius: 25px 25px 0 0}
    nav, nav.navOpen {max-width:100%; width:100%}
    .navCloseBtnWrp, nav.navOpen li span {display:none}

    nav .listWrp {position: relative; top:-10px}
    nav .listWrp > ul {display:flex; width:100%; justify-content: space-around; max-width:250px; margin:0 auto}
    nav .listWrp > ul > li {margin-bottom:0; max-width:31px}

    .tagList {position:fixed; transform: none; width:100%; bottom:10px; right:0; padding-bottom:15px; padding-right:10px}
    .tagList.listOpn {right:0; bottom:22px}
  }
</style>
