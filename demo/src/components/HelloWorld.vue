<template>
  <div>
    <Test :msg="'tttt'" @eventTest1="fn1"  @eventTest2="fn2" />
    <testProps :msg="'tttt'" @eventTest1="fn1"  @eventTest2="fn2" />
  </div>
</template>

<script lang="ts">
import Test from "./test.vue";
import testProps from "./testProps.vue";
import { accessController } from "@gaoding/access-controller";
export default {
    name: 'HelloWorld',
    components: {
        Test: accessController('C')(Test),
        testProps: accessController({
            enable: true,
            action: {
                type: 'event',
                name: 'eventTest1',
                execution: (data) => {
                    console.log('我已经拦截了事件');
                    console.log(data);
                },
            },
            code: 'EVENT_INTEERCEPT && MARK',
            // props-> prop: key
            props: {
                showMark: 'MARK',
                showVip: 'VIP'
            },
        })(testProps),
    },
    data() {
        return {
            a: 123,
        }
    },
    methods:{
        fn1() {
            console.log('不拦截自定义事件')
        },
        fn2() {
            console.log('fn2')
        },
    },
}
</script>

<style>

</style>