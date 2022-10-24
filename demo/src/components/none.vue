<template>
  <div>
    <div v-if="auth_show">none组件</div>

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
    methods: {
    },
}
</script>

<style>

</style>