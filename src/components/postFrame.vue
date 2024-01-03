<template>
  <div class="blogPosts">
    <post :posts="postConts"/>
    <div class="postNavi">
      
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import post from '@/components/post'
import firebase from 'firebase/app'
import 'firebase/database'

export default {
  name: 'PostFrame',
  data () {
    return {
      postId: this.$route.params.postId,
      postConts: '',
      prev:'',
      next:'',
      cateList:''
    }
  },
  components: { post },
  computed: {
    ...mapState({
          config: state => state.config
      })
  },
  watch: {
    '$route' (to, from) {
      // 경로 변경에 반응하여...
      this.postId = to.params.postId
      this.postLoad()
    }
  },
  created (){
    this.$store.commit('config/nowPage_mutations',{page: this.$vnode.tag.split('-')[3], writeMode: this.$session.get('writeMode')});
    this.$router.beforeEach((to, from, next) => {
      next()
    });
    this.postLoad()
  },
  methods: {
    postLoad() {
      var postId = Number(this.postId);
      firebase.database().ref('posts').orderByChild('createOrder').equalTo(postId).once('value', (snap) => {
        snap.forEach((child)=>{
          this.postConts = child.val();
        })
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .blogPosts {max-width: 900px; width: 100%; margin: 0 auto 30px}
</style>
