<template>
  <div @click="test">
    测试333
    <div v-if="auth_show">我需要隐藏</div>

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
        msg: {
            type: String,
            default: '',
        }
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