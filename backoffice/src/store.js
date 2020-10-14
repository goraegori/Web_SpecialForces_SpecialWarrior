import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import router from './routes/index.js';

Vue.use(Vuex);

const resourceHost = "https://spefor.ml/api/v1";
const localTokenData = JSON.parse(localStorage.getItem('tokenData'));
const initialState = localTokenData?  localTokenData : null;

const localUserData = JSON.parse(localStorage.getItem('userData'));
const initialUserData = localUserData?  localUserData : null;

function SaveToken(state){
    localStorage.setItem('tokenData',JSON.stringify(state.tokenData));
}
function SaveUser(state){
    localStorage.setItem('userData',JSON.stringify(state.userData));
}

function ClearToken(){
    localStorage.removeItem('tokenData');
}
function ClearUser(){
    localStorage.removeItem('userData');
}
const axiosInterceptor = axios.interceptors.response.use(
    function (response) {
        //status == 200
        return response;
    },

    function (error) {
        //status != 200
        
        if(error.response.data.error) //FROM AUTH Process
            //alert(error.response.data.error_description);
            store.commit('pushAlert',{idx:store.state.alerts.length,type:'error',message:error.response.data.error_description});
        else //FROM API
            store.commit('pushAlert',{idx:store.state.alerts.length,type:'error',message:error.response.data.message});

        return Promise.reject(error);
    }
);
axiosInterceptor;

export const store = new Vuex.Store({
    state:{
        userData:initialUserData,
        tokenData:initialState,
        alerts:[
            
        ],
        accessibleUnit:null,
        selectedUnit:null,
    },
    getters:{
        getTokenData: function(state){
            return state.tokenData;
        },
        getUserData: function(state){
            return state.userData;
        },
        getAccessibleUnit:function(state){
            return state.accessibleUnit;
        },
        getSelectedUnit:function(state){
            return state.selectedUnit;
        },
    },
    mutations:{
        OnLoginSuccess(){
            this.commit('SetAuthorization');
        },
        AfterLoginSuccess(state){
            this.dispatch("getAccessibleUnit");
            this.commit("SetSelectedUnit",{unit_full_name:state.userData.unit_full_name, unit_id:state.userData.unit_id});
            router.push('/');
        },
        OnLogout(){
            router.push('/login');
        },
        pushAlert(state,payload){
            state.alerts.push({idx:state.alerts.length,message:payload.message,type:payload.type});
        },
        closeAlert(state,payload){
            state.alerts.splice(payload.idx,1);
        },
        SetTokenData(state,payload){
            state.tokenData = payload;
            SaveToken(state);
        },
        UnsetTokenData(state){
            state.tokenData = null;
            ClearToken();
        },
        SetUserData(state,payload){
            state.userData = payload;
            SaveUser(state);
        },
        UnsetUserData(state){
            state.userData = null;
            ClearUser();
        },
        SetAuthorization(state){
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.tokenData.access_token}`
        },

        SetAccessibleUnit(state,payload){
            state.accessibleUnit = payload;
        },
        SetSelectedUnit(state,payload){
            state.selectedUnit = payload;
        }
    },
    actions:{
        fetchUser({commit}){
            axios(
                {
                method: 'get',
                url: `${resourceHost}/member/get_userinfo`,
              })
              .then((response)=>{
                  if(response.status==200){
                    commit("SetUserData",response.data.result[0]);
                    commit("AfterLoginSuccess");
                  }
              });
        },
        login({commit}, payload){
            axios(
                {
                method: 'post',
                url: `${resourceHost}/auth/login`,
                data: {
                  grant_type: 'password',
                  client_id: 'webapp',
                  user_id: payload.id,
                  password:payload.pw
                }
              })
              .then((response)=>{
                  if(response.status==200){
                    commit("SetTokenData",response.data);
                    commit('OnLoginSuccess');
                    this.dispatch('fetchUser');
                  }
              });
        },
        logout({commit}){
            commit('UnsetTokenData');
            commit('UnsetUserData');
            commit('OnLogout');
        },
        signup({commit}, payload){
            axios(
                {
                method: 'post',
                url: `${resourceHost}/member/register`,
                data: {
                    user_id: payload.user_id,
                    password: payload.password,
                    cadre_flag: true,
                    army_num: payload.army_num,
                    unit_id: payload.unit_id,
                    email: payload.email,
                    phone: payload.phone,
                }
              })
              .then((response)=>{
                  if(response.status==200){
                    commit("pushAlert",{message:response.result,type:"error"});
                  }
              });
        },
        getAccessibleUnit({commit}){
            axios(
              {
              method: 'get',
              url: `${resourceHost}/cadre/get_accessible_unit`,
            })
            .then((response)=>{
                if(response.status==200){
                  commit('SetAccessibleUnit',response.data.result[0]);
                }
            });
          },
    }
    
})