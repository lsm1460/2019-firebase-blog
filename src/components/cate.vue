<template>
  <div>
    <div class="cateListWrp" :class="{'aniRunning':listChangeAnimation}">
      <div class="searchWrp" :class="[searchFncOpn? 'searchFnc inserting':'', searchFailure? 'searchFailure':'']" v-click-outside="searchFncTaggle" @keyup.esc="searchFncTaggle" @keyup.enter="searchAddEnter"> <!-- searchingTagList.length != 0 -->
        <div class="wrpForInputAndBtn">
          <input id="searchPost" type="text" placeholder="SEARCH" v-model="insertedSearchText" @keyup.down="selectMove('down')" @keyup.up="selectMove('up')" @focus="searchFncTaggle('focus')">
          <div class="searchBtnWrp">
            <div @click="tagAdd" class="tagSearchBtn"></div>
            <div @click="searchText(insertedSearchText)" class="textSearchBtn"></div>
          </div>
        </div>
        <div class="cateBarWrp">
          <div v-bar class="cateBar barColorBlack" v-bind:style="{height:searchingTagList.h+'px'}">
            <div id="forScrollMove">
              <div id="forKeyboardMove">
                <ul>
                  <li v-for="(tag, index) in searchingTagList.a" :key="index" @click="searchedTagAdd(tag.highLight+tag.normalTxt)" class="searchingTags"><p>#<span class="tagsHightLight">{{tag.highLight}}</span>{{tag.normalTxt}}</p></li>
                </ul>
                <ul>
                  <li v-for="(search, index) in recentSearchComputed" :key="index" :class="search.cla" @click="searchText(search.msg)"><span v-if="search.cla == 'rSearchedText'">recent</span><p>{{search.msg}}</p></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="contsListWrp">
        <div class="tagList">
          <p @click="searchDelete" v-if="routerQuery.search">searched Text :<span class="searchedText" :class="{'beforeDelete':beforeDelete}">{{routerQuery.search}}</span></p>
          <p><span v-if="routerQuery.search">in </span>tag</p>
          <ul>
            <li @click="removeTag(index, tag)" @mouseover="beforeSearchDelete" @mouseout="deleteSearchCancel" v-for="(tag,index) in searchTag" :class="{'notFirstTag':index != 0}" :key="index">#{{tag}}</li>
          </ul>
        </div>
        <div class="postList">
          <ul :class="{'noResultPost':computeList.result.length == 0}">
            <li v-for="(post, index) in computeList.result" :key="index" @click="showPostList(post.createOrder, $event)">
              <div class="postListWrp">
                <div>
                  <p>{{post.title}}</p>
                  <router-link class="linkToEdit" v-if="$session.exists()" :to="{name:'Write', params:{postId:post.createOrder}}">edit</router-link>
                </div>
                <div>
                  <p><span v-for="(tag, i) in post.tag" :key="i">#{{tag}} </span></p>
                  <p>{{post.date}}</p>
                </div>
              </div>
            </li>
            <li v-if="computeList.result.length == 0"><p>조건에 해당하는 포스트가 없습니다.</p></li>
          </ul>
          <ul class="pageNations">
            <li v-for="(page, index) in computedPost[nowTab]" :key="index" @click="pageMove(page)" :class="{'active':page == nowPage}">{{page}}</li>
          </ul>
        </div>
      </div>
      <p class="displayNone">{{insertTag}}</p>
    </div>
    <div class="blogPostsWrp" :class="{'selectedPost':postOpen}">
      <div>
        <div class="notClose blogPosts">
          <post :posts="postConts"/>
        </div>
        <div class="postMoveBtnWrp">
          <div v-if="prevShow" class="postMoveBtn postMovePrev" @click="postMover('prev')"><div></div><p>PREV</p></div>
          <div class="postCloser" @click="postClose"></div>
          <div v-if="nextShow" class="postMoveBtn postMoveNext" @click="postMover('next')"><div></div><p>NEXT</p></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import firebase from 'firebase/app';
import post from '@/components/post'
import 'firebase/database'

export default {
  name: 'Cate',
  data () {
    return {
      insertTag: this.$route.params.tag,
      searchFncOpn: false,
      searchFailure: false,
      beforeDelete:false,
      insertedSearchText:'',
      searchTag: [],
      postList: [],
      searchArea: [],
      listChangeAnimation: false,
      allPageLength:'',
      pagePostLimit:25,
      oncePostLoad:5,
      oncePageLoad:5,
      nowPage:this.$route.params.pageNum,
      nowTab:0,
      maxPageNum: '',
      postOpen:false,
      postConts: {postID: 0, title: '', tag: [], date:'', contents: '', createOrder:0},
      nowPost: this.$route.params.postId,
      routerQuery:{addTag:[], search:''},
      recentSearchList:[]
    }
  },
  watch: {
    '$route' (to, from) {
      // 경로 변경에 반응하여...
      if(to.params.tag != from.params.tag){
        this.insertTag = to.params.tag;
        this.cateReset(to.params.tag)
      }

      if(to.params.pageNum != from.params.pageNum){
        this.pageMove(to.params.pageNum)
      }else{
        if(to.params.postId != 'board'){
          this.nowPost = to.params.postId
          this.nowPostLoad()
        }else{
          this.nowPost = 'none'
          this.postOpen = false;
          document.getElementsByTagName("BODY")[0].style.overflowY="scroll";
        }
      }

      if(Object.keys(to.query).length == 0 && Object.keys(from.query).length != 0){
        this.cateReset(to.params.tag)
      }
    }
  },
  components: { post },
  computed: {
    ...mapState({
        config: state => state.config
    }),
    computeList() {
      var adminFilter = [];
      this.postList.forEach((post) => {
        if(this.$session.exists()){
          adminFilter.push(post);
        }else{
          
            if(!post.onlyAdmin){
              adminFilter.push(post);
            }
        }
      });
      
      var returnArray = [];
      var loadLimit = (this.nowPage-1)*this.oncePostLoad;
      for(var i = loadLimit; i < loadLimit+this.oncePostLoad; i++){
        if(adminFilter[i] != undefined){
          returnArray.push(adminFilter[i])
        }
      }
      return {result:returnArray, filterLength:adminFilter.length, filtered:adminFilter} //adminFilter.length
    },
    computedPost() {
      var pages = Math.floor(this.computeList.filterLength/this.oncePostLoad);
      var leftPost = this.computeList.filterLength%this.oncePostLoad != 0? 1:0;
      var allPages = pages+leftPost //[1,2,3,4], 5 , 6, 10
      if(allPages%this.oncePageLoad != 0){
        var pageTab = Math.floor(allPages/this.oncePageLoad) //allPages [1,2,3,4] , 6 -> pageTab 0,1
      }else{
        var pageTab = Math.floor(allPages/this.oncePageLoad)-1 //allPages 5, 10  -> pageTab 0,1
      }
      
      var resultPages = []

      for(var i = 0; i < pageTab +1; i++){
        resultPages.push([]);
        for(var j = 1; j < allPages+1; j++){
          if(this.oncePageLoad*i < j && j <= (i+1)*this.oncePageLoad){
            var posInTab = j%this.oncePageLoad;
            if(posInTab != 0){
              resultPages[i][posInTab-1] = j
            }else{
              resultPages[i][this.oncePageLoad-1] = j
            }
          }
        }
      }
      
      return resultPages
    },
    searchingTagList(){
      var resultArray = [];
      if(this.insertedSearchText){
        var matchedTxt = this.config.tags.filter(tag => {
          return tag.toLowerCase().indexOf(this.insertedSearchText.toLowerCase()) == 0
        })

        matchedTxt.forEach(txt => {
          resultArray.push({highLight:this.insertedSearchText, normalTxt:txt.split(this.insertedSearchText)[1]})
        });
      }else{
        this.config.tags.forEach(tag => {
          resultArray.push({highLight:'', normalTxt:tag});
        })
      }

      var cateBarHeight = (resultArray.length * 35)-5
      return {a:resultArray , h:cateBarHeight}
    },
    sendParams() {
      return this.searchTag.join('&');
    },
    prevShow(){
      var sp = this.postsForBtn()  //1,3,5
      this.postConts.createOrder //3 
      var nowL = ''
      sp.forEach((p,i)=>{
        if(p == this.postConts.createOrder){
          nowL = i
        }
      })

      if(nowL != 0){
        return true
      }else{
        return false
      }
    },
    nextShow(){
      var sp = this.postsForBtn()  //1,3,5
      var spLast = sp.length
      this.postConts.createOrder //3 
      var nowL = ''
      sp.forEach((p,i)=>{
        if(p == this.postConts.createOrder){
          nowL = i
        }
      })

      if(nowL != spLast-1){
        return true
      }else{
        return false
      }
    },
    recentSearchComputed(){
      if(this.recentSearchList.length == 0){
        return [{cla:'noResult', msg:'최근 검색결과가 없습니다.'}]
      }else{
        var returnResult = []
        var unique = this.recentSearchList.filter(this.onlyUnique);
        unique.forEach((search,index) => {
          returnResult.push({cla:'rSearchedText', msg:search})
        });
        return returnResult
      }
    }
  },
  created (){
    this.$store.commit('config/nowPage_mutations',{page: this.$vnode.tag.split('-')[3], writeMode: this.$session.get('writeMode')});
    this.searchTag[0] = this.insertTag;
    firebase.database().ref('posts').limitToLast(1).once('value').then((snapshot)=>{
      snapshot.forEach((child) => {
        var childKey = child.key;
        this.allPageLength = Number(childKey)
      });
    });
    
    if(this.$route.query.addTag || this.$route.query.search){
      if((this.$route.query.search != undefined || this.$route.query.search != '') && (this.$route.query.addTag == undefined || this.$route.query.addTag == '')){
        this.routerQuery.search = this.$route.query.search
        this.insertedSearchText = this.$route.query.search
        this.pageListReset('textSearch');
      }else if((this.$route.query.search == undefined || this.$route.query.search == '') && (this.$route.query.addTag != undefined || this.$route.query.addTag != '')){
        if(typeof(this.$route.query.addTag) != 'string'){
          this.$route.query.addTag.forEach(tag=>{
            this.tagSearchReset(tag)
          });
          this.routerQuery.addTag = this.$route.query.addTag
        }else{
          this.tagSearchReset(this.$route.query.addTag);
          this.routerQuery.addTag[0] = this.$route.query.addTag
        }
      }else{
        this.routerQuery.search = this.$route.query.search
        this.insertedSearchText = this.$route.query.search

        if(typeof(this.$route.query.addTag) != 'string'){
          this.$route.query.addTag.forEach(tag=>{
            this.tagSearchReset(tag, 'textSearch')
          });
          this.routerQuery.addTag = this.$route.query.addTag
        }else{
          this.tagSearchReset(this.$route.query.addTag, 'textSearch');
          this.routerQuery.addTag[0] = this.$route.query.addTag
        }

      }
      this.selectTab();
    }else{
      this.pageListReset();
      this.selectTab();
    }
  },
  methods: {
    searchFncTaggle(action) {
      if(action == 'focus'){
        this.searchFncOpn = true;
      }else{
        this.searchFncOpn = false;
        this.insertedSearchText = '';
        document.getElementById('searchPost').blur();
        document.getElementById('forScrollMove').scrollTo(0,0)
        document.getElementById('forKeyboardMove').childNodes.forEach(child => {
          if(child.tagName == 'UL'){
            child.childNodes.forEach(li => {
              li.classList.remove('active')
            })
          }
        })
      }
    },
    tagAdd() {
      this.searchFncOpn = false
      var insert = true;
      if(this.insertedSearchText == ''){
        this.avatarSay('태그를 입력해주세요');
        insert = false
      }
      this.searchTag.forEach((tag) => {
        if(tag == this.insertedSearchText){
          this.avatarSay('이미 검색된 태그입니다.');
          insert = false
          return false
        }
      });
      if(insert){
        this.tagSearchReset(this.insertedSearchText)
        this.routerQuery.addTag.push(this.insertedSearchText)
        this.routerQuery.search = ''
        this.$router.push({name:'Cate', query: this.routerQuery})
      }
    },
    avatarSay(text){
      this.$store.dispatch('config/myAvatar_action', {face:2, say:text});
      this.searchFailure = true;
      setTimeout(() => {
        this.searchFailure = false;
      },this.config.avatarSayTime);
    },
    pageListReset(search) {
      this.postList = [];
      var indexArray = [];

      firebase.database().ref('posts').limitToLast(this.pagePostLimit).once('value').then((snapshot) => {
        if(this.insertTag != 'ALL'){
          snapshot.forEach((child) => {
            child.val().tag.forEach((t) => {
              if(search == 'tagSearch' || search == 'textSearch'){
                this.searchTag.forEach((st) => {
                  if(st == t){
                    indexArray.push(child.val().createOrder);
                  }
                })
              }else{
                if(this.insertTag == t){
                  this.postList.push(child.val());
                }
              }
            })
          })

          if(search == 'tagSearch' || search == 'textSearch'){
            var unique = indexArray.filter( this.onlyUnique );
            unique.forEach((ui) => {
              firebase.database().ref('posts').orderByChild('createOrder').equalTo(Number(ui)).once('value').then((searchSnap) => {
                searchSnap.forEach((er) => {
                  this.postList.push(er.val())
                })
                // more then two tags end
                this.postList.reverse();
                if(search == 'textSearch'){
                  this.searchText(this.insertedSearchText)
                }
              })
            });
          }else{
            // one tag end
            this.postList.reverse();
          }

        }else{
          this.postList = snapshot.val();
          this.postList.reverse();
          //all tag end
        }
        
        this.searchArea = this.postList

        if(this.nowPost != 'none'){
          this.nowPostLoad();
        }
      });
    
    },

    onlyUnique (value, index, self) {
      return self.indexOf(value) === index;
    },
    removeTag(i,t) {
      this.searchTag.splice(i, 1);
      this.routerQuery.search = ''
      this.beforeDelete = false;
      this.routerQuery.addTag.splice(this.routerQuery.addTag.indexOf(t),1);
      this.$router.push({name:'Cate', query: this.routerQuery})
      this.insertedSearchText =this.routerQuery.search;
      this.tagSearchReset()
    },
    tagSearchReset(insertTag, type){
      this.listChangeAnimation = true;
      setTimeout(() => {
        if(insertTag){
          this.searchTag.push(insertTag);
        }
        if(type == 'textSearch'){
          this.pageListReset(type)
        }else{
          this.pageListReset('tagSearch')
        }
        this.listChangeAnimation = false;
      },500); 
    },
    pageMove(page){
      this.nowPage = page
      this.catesRouter({tag:this.insertTag, pageNum:page, postId: 'board'})
    },
    selectTab() {
      var result = 0 
      if(this.nowPage%this.oncePageLoad != 0){
        result= Math.floor(this.nowPage/this.oncePageLoad)
      }else{
        result= Math.floor(this.nowPage/this.oncePageLoad) - 1
      }
      this.nowTab = result
    },
    searchedTagAdd(text){
      this.insertedSearchText = text;
      this.tagAdd()
    },
    showPostList(id , event){
      if(event.target.classList[0] != 'linkToEdit'){
        this.catesRouter({tag:this.insertTag, pageNum:this.nowPage, postId:id})
      }
    },
    postInfoSend(post) {
      this.postOpen = true
      this.postConts = post;
    },
    postClose(event) {
      if(event.target.classList[0] != 'notClose'){
        this.catesRouter({tag:this.insertTag, pageNum:this.nowPage, postId:'board'})
      }
    },
    postMover (d) {
      var po = this.postsForBtn()   //1,3,5
      var pl = po.length-1;         // 2
      var nowP = ''                 //0
      po.forEach((o,i) => {
        if(o == this.postConts.createOrder){      //3
          nowP = i
        }
      })

      var prev, next;

      if(nowP != 0 && nowP != pl){
        prev = po[nowP-1];
        next = po[nowP+1]
      }else if(nowP == 0 && pl != 0){
        prev = po[nowP];
        next = po[nowP+1]
      }else if(nowP == pl && pl != 0){
        prev = po[nowP-1];
        next = po[nowP]
      }else if(nowP == 0 && pl == 0){
        prev = po[nowP];
        next = po[nowP]
      }

      if(d == 'prev'){
        this.catesRouter({tag:this.insertTag, pageNum:this.nowPage, postId:prev})
      }else{
        this.catesRouter({tag:this.insertTag, pageNum:this.nowPage, postId:next})
      }
    },
    postsForBtn(){
      var array = []
      this.computeList.filtered.forEach(post => {
        array.push(post.createOrder)
      });
      return array
    },
    nowPostLoad(){
      this.postList.forEach(post => {
        if(post.createOrder == this.nowPost){
          document.getElementsByTagName("BODY")[0].style.overflowY="hidden"
          this.postInfoSend(post)
        }
      });
    },
    selectMove(dir){
      var nowS, lastS;
      var scrollArea = document.getElementById('forScrollMove');
      var sh = scrollArea.offsetHeight;

      var targetList = []

      document.getElementById('forKeyboardMove').childNodes.forEach(child => {
        if(child.tagName == 'UL'){
          child.childNodes.forEach(li => {
            targetList.push(li)
          })
        }
      })

      lastS = targetList.length - 1;

      targetList.forEach((li,index) => {
        if(li.classList[li.classList.length-1] == 'active'){
          nowS = index
        }
      });

      if(dir == 'down'){
        var nextS;
        if(nowS == undefined && nowS != lastS){
          nextS = 0
        }else if(nowS != undefined && nowS != lastS){
          nextS = nowS +1
        }else{
          nextS = 0
        }

      }else{
        var nextS;
        if((nowS == undefined || nowS == 0) && nowS != lastS){
          nextS = lastS
        }else if((nowS != undefined || nowS != 0) && nowS != lastS){
          nextS = nowS -1
        }else{
          nextS = nowS -1
        }
      }

      targetList.forEach((li , index) => {
        if(index == nextS){
          li.classList.add('active');
          scrollArea.scrollTo(0,li.offsetTop)
        }else{
          li.classList.remove('active')
        }
      })
    },
    searchAddEnter(){
      var targetList = [];
      document.getElementById('forKeyboardMove').childNodes.forEach((child , index) => {
        if(child.tagName == 'UL'){
          child.childNodes.forEach(li => {
            targetList.push(li)
          })
        }
      })

      var noChecked = true;

      for(var i = 0; i< targetList.length-1; i++){
        var li = targetList[i];
        if(li.classList[li.classList.length - 1] == 'active'){
          noChecked = false;
          break
        }
      }

      targetList.forEach((li , index) => {
        if(li.classList[0] == 'searchingTags' && li.classList[li.classList.length - 1] == 'active'){
          this.searchedTagAdd(li.textContent.replace('#',''))
        }else if(li.classList[0] == 'rSearchedText' && li.classList[li.classList.length - 1] == 'active'){
          var searchText = li.childNodes[1].textContent;
          this.searchText(searchText);
        }else if(li.classList[0] == 'noResult' && li.classList[li.classList.length - 1] == 'active'){
          if(this.insertedSearchText == ''){
            this.$store.dispatch('config/myAvatar_action', {face:1, say:'검색어를 입력해주세요'});
          }else{
            this.searchText(this.insertedSearchText);
          }
        }else{
          if(index == targetList.length-1 && noChecked){
            this.searchText(this.insertedSearchText);
          }
        }
      })
      
      this.searchFncTaggle()
    },
    searchText(text){
      if(text == ''){
        this.avatarSay('검색어를 입력해주세요');
        return false
      }

      this.listChangeAnimation = true;
      this.searchFncOpn = false

      setTimeout(() => {
        this.recentSearchList.push(text)
        this.routerQuery.search = text
        this.$router.push({name:'Cate', query: this.routerQuery})
        
        var searchedContents = this.searchArea.filter(post => {
          return post.contents.indexOf(text) != -1 
        });
        var searchedTitle = this.searchArea.filter(post => {
          return post.title.indexOf(text) != -1 
        });

        var searchedAll = searchedContents.concat(searchedTitle)
        var result = searchedAll.filter(this.onlyUnique)
        this.postList = result
        this.listChangeAnimation = false;
      },500);
    },
    catesRouter(param){
      if(this.routerQuery.addTag.length == 0 && this.routerQuery.search == ''){
        this.$router.push({name:'Cate', params:param});
      }else{
        this.$router.push({name:'Cate', params:param, query: {addTag:this.routerQuery.addTag, search:this.routerQuery.search}});
      }
    },
    cateReset(toTag,type){
      this.listChangeAnimation = true;
      setTimeout(() => {
        this.routerQuery.addTag = [];
        this.routerQuery.search = '';
        this.searchTag = [];
        this.searchTag[0] = toTag;
        this.nowPage = 1;
        this.pageListReset();
        this.listChangeAnimation = false;
      },500);
    },
    searchDelete(){
      this.listChangeAnimation = true;
      setTimeout(() => {
        this.routerQuery.search = ''
        this.$router.push({name:'Cate', query: this.routerQuery});
        this.nowPage = 1;
        if(this.routerQuery.addTag.length != 0){
          this.pageListReset('tagSearch');
        }else{
          this.pageListReset();
        }
        this.listChangeAnimation = false;
      },500);
    },
    beforeSearchDelete(){
      this.beforeDelete = true
    },
    deleteSearchCancel(){
      this.beforeDelete = false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .displayNone {display:none}
  .cateListWrp {max-width:690px; margin:0 auto; padding:120px 15px 0; position:relative}

  .wrpForInputAndBtn {position:relative}
  .searchWrp {width:96%; left:50%; transform: translateX(-50%); z-index:1; position:absolute; top:40px; border:1px solid #e2e2e2;  border-radius:30px; overflow:hidden; background-color:#fff; transition:.2s all}
  .searchWrp .searchBtnWrp {position:absolute; display:flex; right:0; top:50%; transform: translateY(-50%); opacity:0; cursor:auto; transition:.2s all}
  .searchWrp .searchBtnWrp > div {margin:0 8px; cursor:pointer; border-radius: 12px; transition:.2s all; width:24px; height:24px; display:flex; align-items: center; justify-content: center}
  .searchWrp .searchBtnWrp > div:hover {background-color:#3b3146}
  .searchWrp .searchBtnWrp > div::before {background-image:url('/static/images/cateIcon.png'); content:''; display:block;}

  .searchWrp .searchBtnWrp > .tagSearchBtn::before {width:12px; height:14px; background-repeat:no-repeat; background-position: 0 -75px}
  .searchWrp .searchBtnWrp > .tagSearchBtn:hover::before {background-position: -12px -75px}

  .searchWrp .searchBtnWrp > .textSearchBtn::before {width:14px; height:14px; background-repeat:no-repeat; background-position: 0 -89px}
  .searchWrp .searchBtnWrp > .textSearchBtn:hover::before {background-position: -13px -89px}

  .searchWrp .cateBarWrp {height:0; transition:.2s all; opacity:0; overflow:hidden}
  .searchWrp.inserting .cateBarWrp {height:120px; opacity:1}
  .searchWrp .cateBar {max-height:120px; opacity: 1}

  .searchWrp.searchFnc {box-shadow: 1px 2px 15px rgba(0,0,0,.2);}
  .searchWrp.searchFnc .searchBtnWrp {opacity:1; pointer-events: all}
  .searchWrp .cateBar ul li {padding:5px 10px 5px 15px; margin-bottom:5px; cursor:pointer}
  .searchWrp .cateBar ul li:last-child {margin-bottom:0}
  .searchWrp .cateBar ul li:hover, .searchWrp .cateBar ul li.active {background-color:#444}
  .searchWrp .cateBar ul li p, .searchWrp.inserting > ul li span {font-size:14px; transition:.2s font-weight}
  .searchWrp .cateBar #forKeyboardMove span.tagsHightLight {color:#e6751f; font-weight: 600}
  .searchWrp .cateBar ul li:hover p, .searchWrp .cateBar ul li.active p, .searchWrp.inserting > ul li:hover span, .searchWrp.inserting > ul li.active span {font-weight: 700}
  .searchWrp .cateBar ul li:hover p, .searchWrp .cateBar ul li.active p {color:#fff}

  .searchWrp .cateBar ul {border-bottom:1px solid #efefef; padding-bottom:15px; width:98%; margin:0 auto}
  .searchWrp .cateBar ul .noResult {text-align:center; padding:30px 0; pointer-events:none}
  .searchWrp .cateBar ul .noResult p {color:#bdbdbd}

  .searchWrp .cateBar ul .noResult.active {background-color:transparent}
  .searchWrp .cateBar ul .noResult.active p {font-weight: bold; color:#222}

  .rSearchedText span {display:inline-block; color:#fff; background-color:#222; padding:1px 6px 3px; border-radius: 5px; margin-right: 8px; font-size:11px}
  .rSearchedText p {display:inline-block}
  .rSearchedText:hover span {background-color:#fff; color:#222}

  .cateListWrp input {display:block; width:98%; margin:0 auto; outline:none; font-size:18px; padding:10px 20px; text-align:center; border:none; background-color:transparent}
  .cateListWrp input::placeholder {transition:.2s color; color:#a9a9a9; font-size:12px}
  .cateListWrp input:focus::placeholder {color:transparent}
  .searchWrp.inserting input {border-bottom: 1px solid #c5c5c5;}

  .searchWrp.searchFailure input, .cateListWrp.searchFailure input::placeholder {color:#e53232}
  .searchWrp.searchFailure {background-color:#ffc0c0}

  @keyframes shake {
    0% { transform: translate(1px, 0) }
    10% { transform: translate(-1px, 0)}
    20% { transform: translate(-3px, 0px)}
    30% { transform: translate(3px, 0px)}
    40% { transform: translate(1px, 0px)}
    50% { transform: translate(-1px, 0px)}
    60% { transform: translate(-3px, 0px)}
    70% { transform: translate(3px, 0px)}
    80% { transform: translate(-1px, 0px)}
    90% { transform: translate(1px, 0px)}
    100% { transform: translate(1px, 0px)}
  }

  .cateListWrp > .contsListWrp {display:flex}
  .tagList {width:42.5%; text-align:right; padding-right:40px; opacity:1; transition:.5s all}
  .postList {width:57.5%; transform: scaleY(1); transform-origin: 0 0; opacity:1; transition:.3s all}

  .aniRunning .tagList {opacity:0} 
  .aniRunning .postList {transform: scaleY(0); opacity:0}

  .tagList > p {font-size:18px; margin-bottom:5px}
  .searchedText, .tagList li {font-size:35px; font-weight:bold; word-break: break-all; opacity:1; transition:.8s opacity}
  .searchedText {cursor:pointer; display:block; margin-bottom:35px}
  .tagList li {pointer-events: none}
  .tagList li:after {content:'&'; display:block; font-weight: 300; padding-top:8px}
  .tagList li:last-child:after {display:none}

  .tagList li:nth-child(n+2) {pointer-events: all; cursor:pointer}
  .tagList li:nth-child(n+2):hover, .searchedText:hover, .searchedText.beforeDelete {opacity:.3; animation: shake 0.5s;}

  .postList > ul:nth-child(1) {box-shadow:3px 3px 15px rgba(0,0,0,.1); margin-bottom:20px}
  .postList > ul:nth-child(1) li {background-color:#fff; border-bottom:1px solid #e2e2e2; transition:.2s background-color; cursor:pointer}
  .postList > ul:nth-child(1) li .postListWrp {display:block; padding:8px 20px 15px;}
  
  .postList > ul:nth-child(1) li:hover {background-color:#444}
  .postList > ul:nth-child(1) li:hover p, .postList li:hover span, .postList li:hover a {color:#fff}
  .postList > ul:nth-child(1) li:last-child {border-bottom:none}
  
  .postList > ul:nth-child(1) li .postListWrp div {display:flex}
  
  .postList > ul:nth-child(1) li .postListWrp div:nth-child(1) > p:first-child {font-size:15px; width:80%; font-weight:bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis}
  .postList > ul:nth-child(1) li .postListWrp div:nth-child(2) p:first-child {font-size:12px; margin-right:auto}
  .postList > ul:nth-child(1) li .postListWrp div:nth-child(2) p:last-child {font-size:12px}

  .postList > ul.noResultPost {box-shadow: none}
  .postList > ul.noResultPost li {background-color:transparent; pointer-events: none}
  .postList > ul.noResultPost p {text-align:center; padding:40px 0; font-size:14px; color:#ddd}

  .pageNations {display:flex; justify-content: center}
  .pageNations li {font-size:14px; opacity:.5; cursor:pointer; margin:0 8px}
  .pageNations li.active, .pageNations li:hover {opacity:1}

  .blogPostsWrp {background-color:rgba(40,38,42,.85); position:fixed; overflow-y:auto; z-index:1002; top:0; left:0; width:100%; height:100%; opacity:0; pointer-events: none; transition:.5s opacity}
  .blogPostsWrp > div {position:absolute; width:100%; top:35%; pointer-events: none}
  .blogPosts {max-width: 900px; width: 100%;  overflow:hidden; margin: 0 auto 0; padding-bottom:50px}
  .blogPosts > div {box-shadow: 3px 3px 10px rgba(0,0,0,.2); }

  .postMoveBtnWrp { display: flex; justify-content: center; pointer-events: none}

  .postMoveBtn {position:fixed; top:50%; margin-top:-17.5px; display:flex; align-items: center; cursor:pointer}
  .postMoveBtn.postMovePrev {left:3%}
  .postMoveBtn.postMoveNext {right:3%}

  .postMoveBtn > div {width:35px; height:35px; border-top:1px solid #fff; border-left:1px solid #fff; transform: rotate(-45deg); position:relative}
  .postMoveBtn > p {font-size:19px; font-weight: bold; color:#fff; position: relative; top: -2px; margin: 0 10px;}
  .postMoveBtn.postMoveNext > div {transform: rotate(135deg); order:2}

  .postCloser {position:relative; width:40px; height:40px; overflow:hidden; cursor:pointer; margin:0 55px}
  .postCloser::before, .postCloser::after {content:''; width:100%; height:1px; background-color:#fff; position:absolute; top:50%; left:50%}
  .postCloser::before {transform:translateX(-50%) rotate(45deg)}
  .postCloser::after {transform:translateX(-50%) rotate(-45deg)}

  .blogPostsWrp.selectedPost, .blogPostsWrp.selectedPost .blogPosts, .blogPostsWrp.selectedPost .postMoveBtnWrp {opacity:1; pointer-events: all}

  @media screen and (max-width:1400px){
    .blogPostsWrp > div {top:15vw}

    .postMoveBtn > p {display:none}
  }

  @media screen and (max-width:1100px){
    .postMoveBtn {position:static; margin-top:0}
  }

  @media screen and (max-width:600px){
    .cateListWrp > .contsListWrp {flex-direction: column}
    .tagList, .postList {width:100%}

    .tagList {padding-right:0; text-align:center; margin-bottom:35px}
    .tagList > p {font-size:15px}
    .tagList li:first-child, .searchedText {margin-bottom:15px; font-size:25px}
    .tagList li:first-child::after {font-size:17px}
    .tagList .notFirstTag {display:inline-block; font-size: 13px; border: 1px solid #555; padding: 5px 15px; margin: 0 5px; border-radius: 15px; font-weight: 400}
    .tagList .notFirstTag::after {display:none}

    .blogPosts, .postMoveBtnWrp {padding-bottom:50px}
  }
</style>
