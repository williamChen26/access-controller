<template>
  <div @click="test">
        <div>
            mark值：
            <span>{{ showMark }}</span>
        </div>
        <div>
            Vip值：
            <span>{{ showVip }}</span>
        </div>
        <button @click="test">测试自定义事件</button>
  </div>
</template>

<script>
export default {
    name: 'test',
    props: {
        auth_show: {
            type: Boolean,
            default: false,
        },
        auth_loaded: {
            type: Boolean,
            default: false,
        },
        auth_maps: {
            type: Object,
            default: {},
        },
        auth_disabledClass: {
            type: String,
            default: '',
        },
        showMark: {
            type: Boolean,
            default: true,
        },
        showVip: {
            type: Boolean,
            default: true,
        },
        msg: {
            type: String,
            default: '',
        }
    },
    mounted() {
        console.log(this.auth_maps);
    },
    methods: {
        test() {
            this.$emit('eventTest1', 'weimi', 'chuanpu');
        }
    },
}
</script>

<style>

</style>