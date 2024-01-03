<template>
  <div class="introConversation">
    <div class="conA baloonWrp" :class="[firstClicked? 'clicked':'']">
      <div class="converFace">
        <img src="/static/images/face1.png" alt="" border="0"/>
      </div>
      <div>
        <div class="speechBaloon">
          <p>안녕하세요. 저의 블로그에 오신 것을 환영합니다. <br>이 블로그는 vuejs와 구글의 파이어베이스를 기반으로 만들어졌습니다.<br><br>저는 웹 퍼블리싱과 프론트개발을 하고 있습니다.<br>저에 대해 더 궁금한 사항이 있으시면 아래의 리스트에서 선택하여 주세요.</p>
          <div>
            <ul>
              <li v-for="(que, index) in questions" :key="index" @click="myAnser(index, que.text, {qa: 'first', logI:0}), firstQuestion()"><span>{{index+1}} :</span><p> {{que.text}}</p></li>
            </ul>
          </div>
        </div>
        <p class="timeText">{{startTime.ampm}} {{startTime.hour}}:{{startTime.min}}</p>
      </div>
    </div>
    <ul class="conversList">
      <li class="baloonWrp" v-for="(con, logI) in converseLog" :key="logI" :class="[con.conQ? 'conQ' : '', con.conA? 'conA' : '']">
        <div class="converFace" v-if="con.face">
          <img :src="'/static/images/face'+con.face+'.png'" alt="" border="0"/>
        </div>
        <div>
          <div class="speechBaloon">
            <p v-html="con.text"></p>
            <div class="forLastEmail" v-if="questions.length -1 == (logI-1)/2">
              <p>더 궁금한 사항이 있으시면 lsm1460@gmail.com 로 문의해 주시기 바랍니다.</p>
            </div>
            <div v-if="con.conA">
              <ul>
                <li v-for="(que, index) in notAnseredQues[(logI-1)/2]" :key="index" @click="myAnser(index, que.text, {qa: 'A', logI:(logI-1)/2})">
                  <span>{{index+1}} :</span><p> {{que.text}}</p>
                </li>
              </ul>
            </div>
          </div>
          <p class="timeText">{{con.date.ampm}} {{con.date.hour}}:{{con.date.min}}</p>
        </div>
      </li>
    </ul>
    <div v-if="ansering">작성중...</div>
  </div>
</template>

<script>
var queList = [
  {text:'웹 개발 시 중요하게 생각하는 점은 무엇인가요?'},
  {text:'현 회사에서 한 작업들은 어떤것인가요?'},
  {text:'다룰 수 있는 언어는 어떤것이 있나요?'},
  {text:'앞으로의 계획을 간략히 말해주세요.'}
];
var anserList = [
  {text:'제가 디자인계열 대학교를 나온 후 웹디자인으로 사회생활을 시작하였기 때문인지, 다양한 디바이스에 맞추어 ui/ux의 최적화를 가장 우선적으로 생각하고 작업하고 있습니다. \
  사용자의 입장에서 가장 편한 환경이 무엇인지 항상 고민하고 트렌드를 분석합니다. <br><br>또한 높은 사용자경험을 제공하기 위하여, 코드를 짤 때도 어떻게 하면 조금 더 적은 데이터로 페이지를 구동시킬 수 있을지 생각합니다.',face:1}, 
  {text:'현제 다니고 있는 직장에서 제가 맡은 업무는 프론트개발, 상세페이지, 이벤트 페이지 퍼블리싱 이며, 사이트의 반응형 작업과 리뉴얼 작업, 상세페이지 공통내역 개발, 사내 erp 개발에 참여 하였습니다.',face:4},
  {text:'지금 다룰 수 있는 웹프로그래밍 언어는 현 회사에서 퍼블리싱에 필요한 html, css, jquery와 이 블로그를 만들때 사용된 vuejs 그리고 erp 개발 및 사이트 리뉴얼 작업에 사용한 php, mysql 을 구사할 수 있습니다. <br>다른 프론트개발 언어 및 서버환경도 관심을 갖고 있으며, 기회가 된다면 익혀볼 생각입니다. <br><br>또한 웹디자인을 해왔기 때문에 포토샵과 일러스트레이터를 능숙하게 다루어 냅니다.',face:1},
  {text:'언제가 될지는 알 수 없지만, AR과 VR의 등장으로 웹 환경도 크게 변화가 생길 것으로 생각하고 있습니다. <br><br>그에 맞추어 3d 웹 환경을 사용자에게 지원하기 위해서 threejs를 익히고 있습니다.',face:3}
];
var today = new Date;
var getHours = today.getHours();
var getMin = today.getMinutes()

export default {
  name: 'Intro',
  data () {
    return {
      firstClicked: false,
      questions: queList,
      ansers: [],
      converseLog:[],
      ansering: false,
      notAnseredQues: []
    }
  },
  created (){
    this.$store.commit('config/nowPage_mutations',{page: this.$vnode.tag.split('-')[3], writeMode: this.$session.get('writeMode')});
    anserList.forEach((anser)=>{
      this.ansers.push(anser);
    });
    this.$store.dispatch('config/myAvatar_action', {face:1, say:'저에 대해 궁금하신가요?'});
  },
  computed: {
    emailAdress() {
      var notAnseredList = this.notAnseredQues[this.notAnseredQues.length-1]
      if(notAnseredList){
        if(notAnseredList.length == 0){
          return true
        }else{
          return false
        }
      }
    },
    startTime() {
      var retrunValue = {hour:this.numberFormat(getHours), ampm: '', min:getMin}
      if(getHours > 11){
        retrunValue.ampm = 'PM'
      }else{
        retrunValue.ampm = 'AM'
      }
      return retrunValue
    }
  },
  methods: {
    myAnser(index, que, logI) {
      if(logI.qa){
        var notAnsered = [];
        if(logI.qa == 'first'){
          queList.forEach(function(item){
            notAnsered.push(item);
          });
          notAnsered.splice(index,1);
          this.notAnseredQues[0] = notAnsered;
        }else{
          this.notAnseredQues[logI.logI].forEach(function(item){
            notAnsered.push(item);
          });
        }
      }
      
      if(!this.ansering){
        var nowQ = new Date;
        var nowQHours = nowQ.getHours();
        var nowQMin = nowQ.getMinutes();
        var forBaloon = {hour:this.numberFormat(nowQHours), ampm: '', min:this.numberFormat(nowQMin)};

        if(nowQHours > 12){
          forBaloon.ampm = 'PM'
        }else{
          forBaloon.ampm = 'AM'
        }

        this.converseLog.push( {text:que, conQ:true, date:forBaloon, face:false} );
        this.ansering = true;
        this.nowAnseringIndex = index
        setTimeout(() => {
          window.scrollTo(0, document.body.scrollHeight + 50);
        },100);
        setTimeout(() => {

          var nowA = new Date;
          var nowAHours = nowA.getHours();
          var nowAMin = nowA.getMinutes();

          if(nowAHours > 12){
            forBaloon.ampm = 'PM'
          }else{
            forBaloon.ampm = 'AM'
          }

         this.converseLog.push( {text:this.ansers[index].text, conA:true, date:forBaloon, face:this.ansers[index].face} );
         this.ansers.splice(index,1)
         if(logI.qa == 'A'){
            notAnsered.splice(index,1)
            this.notAnseredQues.push(notAnsered);
          }
          this.ansering = false;
          setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight + 50);
          },100);
        },1000);
      }
    },
    numberFormat(time) {
      if(time < 10){
        return '0'+time
      }else{
        return time
      }
    },
    firstQuestion() {
      this.firstClicked = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .introConversation {max-width:660px; padding:20px 15px 30px; margin:0 auto; display:flex; flex-direction: column}
  .baloonWrp {margin-bottom:15px; opacity:1; transition:0.2s opacity; display:flex; align-items:flex-start; max-width:90%; width:100%}
  .baloonWrp.conQ {max-width:70%}
  .speechBaloon {max-width:400px; width:100%; padding:10px 15px; box-shadow:5px 5px 15px rgba(0,0,0,.2); border-radius:15px; margin-bottom:8px; background-color:#fff; font-size:15px}
  .speechBaloon ul {display: flex; flex-direction: column; align-items: flex-start}
  .speechBaloon li {display: flex; width:100%; cursor:pointer; padding:0 5px}
  .speechBaloon li:hover {background-color:#fff292}
  .speechBaloon li span {width:28px}
  .speechBaloon li p {width:calc(100% - 28px)}

  .speechBaloon p {display:inline-block; font-size:15px; line-height:26px;}
  .speechBaloon li:first-child {margin-top:30px}
  .conversList {display:flex; flex-direction: column}
  
  .converFace {width:62px; height:62px; border-radius:50%; margin-right:10px; overflow:hidden; border:1px solid #c8abeb}
  .converFace img {width:100%}
  .converFace + div {width:calc(100% - 62px)}

  .introConversation .conQ {margin-left:auto; justify-content: flex-end}
  .introConversation .conQ .speechBaloon {background-color:#fff292}

  .baloonWrp.clicked, .conversList > li:nth-last-child(n+3) {pointer-events: none; opacity:.5}
  
  .timeText {font-size:12px}
  .conQ .timeText {text-align:right}

  @media screen and (max-width:600px) {
    .converFace {width:42px; height:42px}
    .speechBaloon {font-size:13px}
  }
</style>
