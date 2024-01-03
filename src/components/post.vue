<template>
  <div class="blogPostWrp">
    <div class="blogPostInner">
        <postHeader :header="posts"/>
        <div class="blogPostContents" v-html="posts.contents"></div>
    </div>
  </div>
</template>

<script>
import postHeader from '@/components/postHeader'
export default {
  name: 'Post',
  props : {
    posts: ''
  },
  components: { postHeader },
  data () {
    return {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .blogPostWrp {background-color:#fff; padding:30px 0 50px}
  .blogPostInner {max-width:860px; width:95%; margin:0 auto}

  .blogPostHeader {display:flex;}
  .blogPostHeader p {font-size:12px; color:#777}
  .blogPostHeader p:last-child {margin-left:auto}

  .blogPostTitle {text-align:center}
  .blogPostTitle h4 {font-size:24px; font-weight:700; display:inline-block; padding:0 3px 3px; border-bottom:1px solid #393939; margin-bottom:55px}
</style>
