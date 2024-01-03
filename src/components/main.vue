<template>
  <div>
    <div class="loadingWrp" :class="{'active':loading}">
      <div>
        <img src="/static/images/moon.png" alt="loading..." border="0"/>
        <img src="/static/images/forLoading.png" alt="loading..." border="0"/>
      </div>
    </div>
    <div class="blogMyName">
      <p>SangMin. LEE</p>
      <p>I'm not done yet</p>
    </div>
    <div class="blogPosts" v-for="(p, index) in posts" :key="index">
      <div v-if="$session.exists()">
        <post :posts="p"/>
      </div>
      <div v-else>
        <post v-if="!p.onlyAdmin" :posts="p"/>
      </div>
    </div>
  </div>
</template>

<script>
import post from '@/components/post'
import firebase from 'firebase/app'
import 'firebase/database'

export default {
  name: 'Main',
  data () {
    return {
      posts: [],
      pagePostLimit:8,
      loadPostStart:0,
      nowPos:'',
      loading:false
    }
  },
  components: { post },
  created (){
    this.$store.commit('config/nowPage_mutations',{page: this.$vnode.tag.split('-')[3], writeMode: this.$session.get('writeMode')});

    this.lastOrderLoad();
    window.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    postLoader (start , load) {
      var startPoint = start - this.pagePostLimit
      if(startPoint < 0){
        startPoint = 0
      }
      var end;
      if(load == 'first'){
        end = start
      }else{
        this.loading = true
        end = start-1
      }
      firebase.database().ref('posts').orderByChild('createOrder').startAt(startPoint).endAt(end).once('value').then((snapshot) => {
        snapshot.forEach(snap => {
          if(snap.val() !== undefined){
            this.posts.push(snap.val())
          }
        });
        this.posts.sort( (a,b) => {
          return b.createOrder - a.createOrder
        } )
        this.loadPostStart = startPoint;
        this.loading = false
      });
    },
    handleScroll(){
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // page End
        this.postLoader(this.loadPostStart ,'pageEnd')
      }
      window.oldScroll = window.scrollY;
    },
    lastOrderLoad() {
      firebase.database().ref('posts').limitToLast(1).once('value').then((snapshot)=>{
        var lastOrder;
        snapshot.forEach((child) => {
          lastOrder = child.val().createOrder;
        });
        this.postLoader(lastOrder, 'first');
      });
    },
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .loadingWrp {position:fixed; top:0; left:0; width:100%; height:100%; z-index:1001; background-color:rgba(50,50,50,.8); pointer-events: none; opacity:0; transition:.1s all}
  .loadingWrp.active {opacity: 1; pointer-events: all}
  .loadingWrp > div {width:152px; height:80px; overflow:hidden; top:50%; left:50%; transform: translate(-50%, -50%);}
  .loadingWrp > div, .loadingWrp > div img {position:absolute}
  .loadingWrp > div img {bottom:0; left:50%; transform: translateX(-50%)}

  .loadingWrp > div img:first-child {width:28px; transform-origin: right bottom; animation: moonMove 2s infinite ease-in-out;}
  .loadingWrp > div img:last-child {width:100%}

  @keyframes moonMove {
    0% {
      transform: translateX(-50%) rotate(0deg);
    }
    25% {
      transform: translateX(-50%) rotate(-90deg);
    }
    50% {
      transform: translateX(-50%) rotate(-180deg);
    }
    100% {
      transform: translateX(-50%) rotate(-360deg);
    }
  }

  .blogMyName {text-align: center; margin-bottom:50px}
  .blogMyName p:first-child {font-family:'Shadows Into Light Two', cursive; font-size:30px; color:#131313; margin-bottom:20px}
  .blogMyName p:last-child {font-size:14px; color:#777}

  .blogPosts {max-width:900px; width:100%; margin:0 auto 30px; box-shadow: 3px 3px 10px rgba(0,0,0,.2)}
  .blogPosts:last-child {margin-bottom:0}
</style>
