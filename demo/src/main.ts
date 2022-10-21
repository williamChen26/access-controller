import Vue from "vue";
import "./style.css";
import App from "./App.vue";
import accessInit from "@gaoding/access-controller";

console.log(2);
accessInit({
    enable: true,
    config: {
        A: true,
        B: true,
        C: true,
        MARK: false,
        VIP: true,
        EVENT_INTEERCEPT: true,
    }
});

new Vue({
    render: (h) => h(App),
}).$mount("#app");
