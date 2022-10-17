<template>
  <div>
    <Test :msg="'tttt'" />
  </div>
</template>

<script>
import Test from "./test.vue";
import { accessController } from "@gaoding/access-controller";
export default {
    name: 'HelloWorld',
    components: {
        Test: accessController({
            enable: true,
            type: 'event',
            key: 'B'
        })(Test)
    },
    data() {
        return {
            a: 123,
        }
    },
}
</script>

<style>

</style>