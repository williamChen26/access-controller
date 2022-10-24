<template>
  <div>
    <button @click="init">init</button>
    <Test :msg="'tttt'" @eventTest1="fn1"  @eventTest2="fn2" />
    <TestProps :msg="'tttt'" @eventTest1="fn1"  @eventTest2="fn2">
        <div>parent default</div>
        <template #footer>parent footer</template>
    </TestProps>
    <None />
  </div>
</template>

<script lang="ts">
import Test from "./test.vue";

import TestProps from "./testProps.vue";
import None from "./none.vue";
import accessInit, { accessController } from "@gaoding/access-controller";

export default {
    name: 'HelloWorld',
    components: {
        Test: accessController('C')(Test),
        TestProps: accessController({
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
        })(TestProps),
        None: accessController({
            action: {
                type: 'none',
            },
            code: 'A || B',
            props: {
                showMark: 'MARK',
                showVip: 'VIP'
            }
        })(None),
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
        init() {
            accessInit({
                enable: true,
                config: {
                    A: true,
                    B: true,
                    C: true,
                    MARK: true,
                    VIP: true,
                    EVENT_INTEERCEPT: true,
                }
            })
        },
    },

}
</script>

<style>

</style>