<template>
  <div class="blogPostHeaderWrp">
    <div class="blogPostHeader">
        <p><span v-for="(tag, tagIndex) in header.tag" :key="tagIndex">#{{tag}} </span></p>
        <p>{{header.date}}</p>
    </div>
    <div class="blogPostTitle"><h4>{{header.title}}</h4></div>
  </div>
</template>

<script>
export default {
  name: 'PostHeader',
  props : {
    header: ''
  },
  data () {
    return {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .blogPostHeader {display:flex; margin-bottom:15px}
  .blogPostHeader p {font-size:12px; color:#777}
  .blogPostHeader p:last-child {margin-left:auto}

  .blogPostTitle {text-align:center}
  .blogPostTitle h4 {font-size:24px; font-weight:700; display:inline-block; padding:0 3px 3px; border-bottom:1px solid #393939; margin-bottom:55px}
</style>
