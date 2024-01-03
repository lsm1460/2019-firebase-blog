<template>
  <div class="writeMode">
    <div class="writeModeTab editorArea">
      <div class="tabHeader">
        <div v-for="(tab, index) in posts" :key="index" :class="[tab.active? 'active' : '']">
          <p>{{titleCompute}}</p>
        </div>
        <div class="newEditor" @click="loadPost">
          <p>+</p>
        </div>
      </div>
      <div class="tabcontainer">
        <div class="editorInsertArea" v-for="(post, index) in posts" :key="index" :class="[post.active? 'active' : '']">
          <div class="tabInsertHeader">
            <div>
              <div class="tabInsertArea"><span>TITLE</span> <input type="text" v-model="post.title" placeholder="TITLE"/></div>
              <div class="tabInsertArea"><span>TAG</span>
                <div class="tagSelectWrp" @click="tagListOpen" v-click-outside="outside">
                  <ul class="selectedTags" :class="{'tagInHear':insertedTag}">
                    <li class="addNewTag" :class="{'active':readyNewTag}"><input id="forNewTag" @blur="onBlur(index)" v-model="newTag" v-on:keyup.enter="addTag(index)" v-on:keyup.space="addTag(index)" type="text"></li>
                    <li v-for="(tag, i) in post.tag" :key="i" @click="tagRemove(index, i, tag)">#{{tag}}</li>
                  </ul>
                  <div class="vBarWrp" :class="{'selectOpen':insertTag}">
                    <div v-bar>
                      <div>
                        <ul>
                          <li @click="addNewTag">+ new</li>
                          <li v-for="(tag,j) in config.tags" :key="j" @click="addOriginTag(tag , index)">#{{tag}}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p>비공개 <input type="checkbox" v-model="post.onlyAdmin" /></p>
              <input type="file" id="fileElem" multiple accept="image/*" @change="handleBtnFile">
              <label class="button" for="fileElem">Select some files</label>
            </div>
          </div>
          <textarea placeholder="CONTENTS..." v-model="post.contents" v-on:dragenter.prevent="addHighlight" v-on:dragover.prevent="addHighlight" @dragleave="unhighlight" @drop.prevent="handleDrop" :class="{'highlight':highlight}">

          </textarea>
        </div>
      </div>
    </div>
    <div class="writeModeTab visualizeArea">
      <div class="tabHeader">
        <div v-for="(renderTab, index) in posts" :key="index" :class="[renderTab.active? 'active' : '']">
          <p>RENDERING</p>
        </div>
      </div>
      <div class="tabcontainer">
        <div class="editorRenderArea" v-for="(render, index) in posts" :key="index" :class="[render.active? 'active' : '']">
          <div class="renderingArea">
            <div>
              <postHeader :header="render"/>
              <div v-html="render.contents" @mouseover="imgMOver" @mouseout="imgMLeave" @click="imgDeleter"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="btnWrp">
      <div @click="beforeUpload">UPLOAD</div>
    </div>
    <div class="postListWrp" :class="{'active':tagList}" @click="postListOff">
      <div class="postList">
        <p>load</p>
        <ul class="tagList">
          <li></li>
        </ul>
        <ul class="posts">
          <li></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
var now = new Date;
var years = now.getFullYear();
var month = now.getMonth() + 1;
var date = now.getDate();
var today = years+'-'+month+'-'+date;

var newTemplate = {postID: 0, title: 'NEW', tag: [], date:today, contents: '<p>upload test</p>', active: true, onlyAdmin: false}

import postHeader from '@/components/postHeader'
import firebase from 'firebase/app'
import 'firebase/database'
import 'firebase/storage'
import { mapState } from 'vuex'

export default {
  name: 'Write',
  data () {
    return {
      insertPostId: this.$route.params.postId,
      posts: [{postID: 0, title: 'NEW', tag: [], date:today, contents: '<p>upload test</p>', active: true, onlyAdmin: false}],
      data: this.$session.get('writeMode'),
      tagList:false,
      insertTag:false,
      readyNewTag:false,
      insertedTag:false,
      newTag:'',
      newTagList: [],
      highlight: false,
      uploadedImage:[],
      storageRef: firebase.storage().ref()
    }
  },
  components: { postHeader },
  watch: {
    '$route' (to, from) {
      // 경로 변경에 반응하여...
      if(to.params.postId == 'new'){
        this.reNewPostId()
        this.posts[0].title = newTemplate.title;
        this.posts[0].tag = newTemplate.tag;
        this.posts[0].date = newTemplate.date;
        this.posts[0].contents = newTemplate.contents;
        this.posts[0].active = newTemplate.active;
        this.posts[0].onlyAdmin = newTemplate.onlyAdmin;
      }
    }
  },
  computed: {
    ...mapState({
          config: state => state.config
      }),
      titleCompute(){
      if(!this.posts[0].title || this.posts[0].title == ''){
        return 'New Title'
      }else{
        return this.posts[0].title
      }
    }
  },
  beforeCreate: function () {
    if (!this.$session.exists()) {
      alert('잘못된 접근입니다.');
      this.$router.push('/')
    }
  },
  created (){
    this.$session.set('writeMode',true);
    document.getElementsByTagName("HTML")[0].classList.add('writeMode');
    this.$store.commit('config/gnb_reset');
    this.$store.dispatch('config/gnbToggle_action', 'close');
    this.$store.commit('config/nowPage_mutations',{page: this.$vnode.tag.split('-')[3], writeMode: this.$session.get('writeMode')});
    
    if(this.insertPostId != 'new'){
      var postId = Number(this.insertPostId)-1
      firebase.database().ref('posts/'+String(postId)).once('value').then((snapshot)=>{
        this.posts[0].title = snapshot.val().title;
        this.posts[0].postID = snapshot.val().createOrder-1;
        this.posts[0].tag = snapshot.val().tag;
        this.posts[0].date = snapshot.val().date;
        this.posts[0].contents = snapshot.val().contents;
        this.posts[0].onlyAdmin = snapshot.val().onlyAdmin;
        this.posts[0].active = true;
        this.insertedTag = true
      });
    }else{
      this.reNewPostId()
    }

  },
  beforeDestroy () {
    document.getElementsByTagName("HTML")[0].classList.remove('writeMode');
    if (this.$session.exists()) {
      this.$session.set('writeMode',false);
    }
  },
  methods: {
    upload () {
      console.log('upload start ---------');
      firebase.database().ref('posts/'+this.posts[0].postID).set({
        title: this.posts[0].title,
        tag: this.posts[0].tag,
        date : this.posts[0].date,
        contents: this.posts[0].contents,
        createOrder: this.posts[0].postID+1,
        onlyAdmin: this.posts[0].onlyAdmin
      },(error) => {
        if(error){
          console.log(error);
        }else{
          if(this.insertPostId == 'new'){
            alert('업로드되었습니다.');
          }else{
            alert('수정되었습니다.');
          }
        }
      });

      if(this.newTagList.length != 0){
        this.newTagList.forEach((item, index) => {
          var nextTagNo = Number(this.config.tags.length)+index+1;
          firebase.database().ref('tags/'+nextTagNo).set(item,(error)=>{
            if(error){
              console.log(error);
            }else{
              this.$store.dispatch('config/tagListLoad_action');
              alert('태그가 추가되었습니다.');
            }
          });
        })
      }

    },
    loadPost () {
      this.tagList = true
    },
    postListOff(event){
      if(event.target.classList[0] == 'postListWrp'){
        this.tagList = false
      }
    },
    tagListOpen(event) {
      if(event.target.classList[0] == 'selectedTags'){
        this.insertTag = !this.insertTag
      }
    },
    addNewTag() {
      this.readyNewTag = true;
      this.insertedTag = true;
      setTimeout(()=>{
        document.getElementById('forNewTag').focus();
        this.insertTag = false
      },100)
    },
    addTag (index) {
      this.posts[index].tag.unshift(this.newTag);
      this.newTagList.push(this.newTag)
      this.newTag = ''
      this.readyNewTag = false;
    },
    addOriginTag (tag , index) {
      var insertCheck = true
      this.posts[index].tag.forEach((t) => {
        if(t == tag){
          insertCheck = false;
          return false
        }
      });
      if(insertCheck){
        this.posts[index].tag.push(tag);
      }
      this.insertedTag = true;
      this.insertTag = false;
    },
    onBlur (index) {
      this.readyNewTag = false;
      if(this.posts[index].tag.length == 0){
        this.insertedTag = false
      }
    },
    tagRemove(index, arrayN, tag) {
      this.posts[index].tag.splice(arrayN, 1);
      if(this.posts[index].tag.length == 0){
        this.insertedTag = false
      }

      var newTagRemove = this.newTagList.indexOf(tag);
      if(newTagRemove != '-1'){
        this.newTagList.splice(newTagRemove, 1);
      }
    },
    outside() {
      this.insertTag = false
    },
    reNewPostId() {
      firebase.database().ref('posts').limitToLast(1).once('value').then((snapshot)=>{
        snapshot.forEach((child) => {
          var childKey = child.key;
          this.posts[0].postID = Number(childKey) + 1
        });
      });
    },
    
    addHighlight() {
      this.highlight = true;
    },
    unhighlight() {
      this.highlight = false;
    },
    handleBtnFile(event) {
      let files = event.target.files

      this.handleFiles(files)
    },
    handleDrop(event) {
      this.unhighlight();
      let dt = event.dataTransfer
      let files = dt.files

      this.handleFiles(files)
    },
    handleFiles(files) {
      ([...files]).forEach(this.uploadFile)
    },
    uploadFile(file){
      var fileName = Date.now()+'_'+file.name;
      this.uploadedImage.push({fn:fileName, file:file, src:''});
      this.firebaseStorageUp(fileName, file, 'temp')
    },
    firebaseStorageUp(fileName, file , pos){
      var uploadTask = this.storageRef.child(pos+'/'+fileName).put(file);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        snapshot => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
        }, error => {
          console.log(error.code);
      }, () => {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL);
          if(pos == 'temp'){
            this.posts[0].contents += '<img src="'+downloadURL+'" alt="" border="0"/>';
            this.uploadedImage.forEach(img => {
              if(img.fn == fileName){
                img.src = downloadURL
              }
            })
          }else{
            this.uploadedImage.forEach(img => {
              if(img.fn == fileName){
                console.log('temp : '+ img.src);
                console.log('post :' +downloadURL);
                this.posts[0].contents = this.posts[0].contents.replace(img.src,downloadURL)
              }
            })
            this.upload()
          }
        });
      });
    },
    beforeUpload() {
      if(!this.posts[0].title || this.posts[0].title == ''){
        alert('제목을 입력해주세요');
        return false
      }else if(this.posts[0].tag.length == 0){
        alert('태그를 선택해주세요');
        return false
      }else if(!this.posts[0].contents || this.posts[0].contents == ''){
        alert('내용을 입력해주세요');
        return false
      }

      if(this.uploadedImage.length != 0){
        this.uploadedImage.forEach(img => {
          this.firebaseStorageUp(img.fn, img.file, 'postImg');
          this.tempImgRemover(img.fn);
        });
      }else{
        this.upload()
      }
    },
    tempImgRemover(fileName){
      var desertRef = this.storageRef.child('temp/'+fileName);
      desertRef.delete().then(function() {
        // File deleted successfully
        console.log(fileName+' is removed');
      }).catch(function(error) {
        // Uh-oh, an error occurred!
        console.log(error.code);
      });
    },
    imgMOver(e){
      if(e.target.nodeName == 'IMG'){
        e.target.classList.add('test')
      }
    },
    imgMLeave(e){
      if(e.target.nodeName == 'IMG'){
        e.target.classList.remove('test')
      }
    },
    imgDeleter(e){
      if(e.target.nodeName == 'IMG'){
        var clickedSrc = e.target.src;
        var getName = clickedSrc.split('%2F')[1].split('?')[0]
        var targetString = '<img src="'+clickedSrc+'" alt="" border="0"/>';
        this.posts[0].contents = this.posts[0].contents.replace(targetString,'');
        this.tempImgRemover(getName)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  html,body, #app {height:100%}
  .writeMode {height:calc(100% - 55px); padding:10px 15px 0; display:flex; flex-wrap:wrap}
  .writeMode > div {width:49.5%; height:85%}
  .writeMode > div:nth-child(2) {margin-left:auto}
  .writeModeTab .tabHeader {padding-left:15px; display:flex}
  .writeModeTab .tabHeader > div, .writeModeTab .tabcontainer {background-color:#2f2c34}
  .writeModeTab .tabHeader > div {width:120px; border-radius:10px 10px 0 0; padding:8px 10px 5px; margin-right:2px; opacity:.3}
  .writeModeTab .tabHeader > div.active {opacity:1}
  .writeModeTab .tabHeader p {color:#fff; font-size:12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis}

  .writeModeTab .tabHeader .newEditor {text-align:center; cursor:pointer; display:none}
  .writeModeTab .tabHeader:hover .newEditor {opacity:1}

  .writeModeTab .tabcontainer {height:100%}

  .editorInsertArea {padding:40px 10px 35px; height:100%}
  .tabInsertHeader {margin-bottom:40px; display:flex}
  .tabInsertHeader > div:first-child {width:70%}
  .tabInsertArea {margin-bottom:30px; padding-left:18px}
  .tabInsertArea:last-child {margin-bottom:0}
  .tabInsertArea span {color:#fff; width:60px; display:inline-block}
  .tabInsertArea > input, .tagSelectWrp {min-width:230px; width:calc(90% - 78px)}
  .tabInsertArea > input, .selectedTags {padding:8px 20px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; background-color:#323035; border-radius: 15px; border:1px solid transparent; box-shadow:inset 3px 3px 5px rgba(0,0,0,.4); color:#fff}
  .tabInsertArea > input:focus {border:1px solid #4f4f4f; outline:none}
  .editorInsertArea textarea {width:100%; height:calc(100% - 144px); resize:none; background-color:#28262a; box-shadow: inset 3px 3px 5px rgba(0,0,0,.4); border:none; outline:none; color:#fff; padding:15px}

  .selectedTags {display:flex; height:40px}
  .selectedTags input {background-color:transparent; border:none; color:#fff; outline:none}
  .selectedTags::before {content:'tag를 선택하세요'; opacity:.3}
  .selectedTags.tagInHear::before {display:none}
  .selectedTags li {color:#fff; padding:0px 3px 1px; cursor:pointer}
  .selectedTags li:hover {color:#fff; background-color:#000}
  .selectedTags li::after {content:','; margin-right:5px}
  .selectedTags li:last-child::after {display:none;}

  .addNewTag {display:none}
  .addNewTag.active {display:block}

  .editorRenderArea {padding:25px; height:100%}
  .renderingArea {height:100%; overflow-y:auto; background-color:#fff; box-shadow:5px 5px 5px rgba(0,0,0,.6); padding:30px 0 50px}
  .renderingArea > div {max-width:860px; width:95%; margin:0 auto}

  .writeMode > .btnWrp {width:100%; height:auto; display:flex; justify-content: flex-end; align-items: flex-start}
  .writeMode > .btnWrp > div {color:#fff; cursor:pointer; padding: 15px 30px; background-color: #493f55; border-radius: 15px; transform: translate(0, -5%); box-shadow: 0 5px 5px rgba(0,0,0,.3); transition:.05s all}
  .writeMode > .btnWrp > div:hover {transform: translate(0,0); box-shadow: 0px 1px 0px rgba(0,0,0,.9); background-color:#2f2c34}

  .tagSelectWrp {display:inline-block; position:relative; vertical-align:top}
  .vBarWrp {position:absolute; display:none; bottom:-3px; transform:translateY(100%); width: 100%; background-color: #38343c; border-radius: 15px; padding: 8px 3px 3px; box-shadow: 3px 3px 3px rgba(0,0,0,.3);}
  .vBarWrp.selectOpen {display:block}
  .vBarWrp > div {height:85px}
  .vBarWrp > div li {color:#fff; padding:3px 10px 5px; font-size:14px; cursor:pointer; border-radius:10px; width:95%}
  .vBarWrp > div li:hover {background-color:#282629}

  .postListWrp {position:fixed; width:100%!important; height:100%!important; top:0; left:0; background-color:rgba(0,0,0,.4); width:100%; z-index:1001; opacity:0; pointer-events: none}
  .postListWrp.active {opacity: 1; pointer-events: all}
  .postList {position:absolute; top:50%; left:50%; background-color:#493f55}
</style>
