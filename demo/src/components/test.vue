<template>
  <div>测试333</div>
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
        auth_map: {
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
    }
}
</script>

<style>

</style>