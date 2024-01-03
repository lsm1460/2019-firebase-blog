<template>
  <div>
    <div class="loginBox" :class="[loginFailure? 'avatarSay':'']">
      <p><input type="text" v-model="id" placeholder="E-MAIL" @keyup.enter="login"/></p>
      <p><input type="password" v-model="pw" placeholder="PASSWORD" @keyup.enter="login"/></p>
      <div @click="login">LOG IN</div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth'
import { mapState } from 'vuex'

export default {
  name: 'Login',
  data () {
    return {
      id: '',
      pw: '',
      loginFailure: false
    }
  },
  computed: {
    ...mapState({
          config: state => state.config
      })
  },
  created() {
    this.$store.dispatch('config/myAvatar_action', {face:1, say:'관리자만 가능합니다'});
    this.$store.commit('config/gnb_reset');
    this.$store.commit('config/nowPage_mutations',{page: this.$vnode.tag.split('-')[3], writeMode: this.$session.get('writeMode')});
  },
  methods: {
    login() {
      firebase.auth().signInWithEmailAndPassword(this.id, this.pw)
      .then(() => {
        this.$store.dispatch('config/myAvatar_action', {face:1, say:'환영합니다'});
        this.$session.start();
        this.$session.set('writeMode',true)
        this.$router.push({name:'Write', params:{postId:'new'}});
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        // ...
        this.loginFailure = true;
        setTimeout(() => {
          this.loginFailure = false;
        },this.config.avatarSayTime);
        this.$store.dispatch('config/myAvatar_action', {face:2, say:'아이디와 비밀번호를 다시 확인해주세요'});
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .loginBox {max-width:350px; padding:0 15px; margin:0 auto; }
  .loginBox p {margin-bottom:15px}
  .loginBox p input {width:100%; background-color:#fff; transition:.2s background-color}
  .loginBox p input:focus {outline:none; border-color:#493f55}
  .loginBox p input::placeholder {transition:.2s color; color:#a9a9a9; font-size:12px}
  .loginBox.avatarSay p input, .loginBox.avatarSay p input::placeholder {color:#e53232}
  .loginBox p input:focus::placeholder {color:transparent}
  .loginBox.avatarSay p input {background-color:#ffc0c0}
  .loginBox p input, .loginBox div {padding:10px 0;  border-radius: 15px; text-align:center; transition:.2s all; border:1px solid #e2e2e2;}
  .loginBox div {cursor:pointer; background-color:#493f55; color:#fff}
  .loginBox.avatarSay div {animation: shake 0.5s; }
  .loginBox div:hover {border-color:#493f55; color:#493f55; background-color:transparent}

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
</style>
