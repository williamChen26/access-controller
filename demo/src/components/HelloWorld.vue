<template>
  <div>
    <Test :msg="'tttt'" @eventTest1="fn1"  @eventTest2="fn2" />
  </div>
</template>

<script lang="ts">
import Test from "./test.vue";
import { accessController } from "@gaoding/access-controller";
export default {
    name: 'HelloWorld',
    components: {
        Test: accessController({
            enable: true,
            // action: {
            //     type: 'event',
            //     name: 'eventTest1',
            //     execution: (...params: any[]) => {
            //         console.log(params);
            //     },
            // },
            code: 'C'
        } as any)(Test)
    },
    data() {
        return {
            a: 123,
        }
    },
    methods:{
        fn1() {
            console.log('fn1')
        },
        fn2() {
            console.log('fn2')
        },
    },
}
</script>

<style>

</style>