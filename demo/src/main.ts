import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import "./style.css";
import App from "./App.vue";
import accessInit from "@gaoding/access-controller";
Vue.use(VueCompositionAPI)
accessInit({
    enable: true,
    config: {
        A: true,
        B: true,
        C: false,
        MARK: false,
        VIP: true,
        EVENT_INTEERCEPT: true,
    }
});

new Vue({
    render: (h) => h(App),
}).$mount("#app");
