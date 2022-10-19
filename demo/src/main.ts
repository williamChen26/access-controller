import Vue from "vue";
import "./style.css";
import App from "./App.vue";
import accessInit from "@gaoding/access-controller";

accessInit({
    enable: true,
    config: {
        A: true,
        B: true,
        C: false,
    }
});

new Vue({
    render: (h) => h(App),
}).$mount("#app");
