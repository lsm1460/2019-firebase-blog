import firebase from 'firebase/app';
import 'firebase/database'

const state = {
    gnbState: false,
    nowPage: '',
    writeMode: false,
    avatarSayTime:2000,
    avatarFase: 1,
    avatarSay: '',
    avatarSayActive: false,
    navList: [
        {name: 'Main', text: 'HOME', image:'home', active: false, ani:false, aniR:false, alt: 'home'},
        {name: 'Intro', text: 'INTRODUCE', image:'intro', active: false, ani:false, aniR:false, alt: 'introduce myself'},
        {name: 'Cate', text: 'CATEGORY', image:'cate', active: false, ani:false, aniR:false, alt: "my study list"},
        //{name: 'Contact', text: 'CONTACT', image:'contact', active: false, ani:false, aniR:false, alt: "contact me"}
      ],
    navBoolean: false,
    navLock: false,
    navSize: false,
    tags:[]
  }

const actions = {
    myAvatar_action (context, avatarInfo) {
        avatarInfo.active = true;
        context.commit('myAvatar_mutations', avatarInfo);
        setTimeout(() => {
            context.commit('myAvatar_mutations', {face:1, say: '', active: false});
        },context.state.avatarSayTime);
    },
    gnbToggle_action (context, onOff) {
        context.commit('gnb_mutations');
        var timeout = 200;
        var timeLimit = timeout * context.state.navList.length
        if(onOff == 'close'){
            context.state.navList.forEach((item, index) => {
            setTimeout(() => {
                item.ani = true;
                item.aniR = false
            },timeout * index);
            });

            setTimeout(() => {
                context.state.navSize = !context.state.navSize;
            },timeLimit);

            context.state.navLock = true;
            context.state.navBoolean = false
        }else{
            context.state.navSize = !context.state.navSize;
            context.state.navList.forEach((item, index) => {
                setTimeout(() => {
                    item.ani = false;
                    item.aniR = true;
                },timeout * (index+1));
            });
            context.state.navLock = false
        }
    },
    tagListLoad_action (context){
        firebase.database().ref('tags').once('value').then((snapshot)=>{
            var tagList = [];
            snapshot.forEach(child => {
                tagList.push(child.val())
            });
            context.state.tags = tagList;
        });
    }
}

const mutations = {
    gnb_mutations (state, date) {
        state.gnbState = !state.gnbState
    },
    gnb_reset(){
        state.navList.forEach((page,index) => {
            page.active = false
        });
    },
    writeMode_mutations (state, date) {
        state.writeMode = date
    },
    nowPage_mutations (state, date) {
        state.nowPage = date.page;
        state.writeMode = date.writeMode
    },
    myAvatar_mutations (state, info) {
        state.avatarSayActive = info.active;
        state.avatarSay = info.say;
        state.avatarFase = info.face;
    },
    tagList_mutations (state, tag) {
        state.tags = tag;
    }
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
  }