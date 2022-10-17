# access-controller

用于编辑器的权限控制

## 特征
- 控制内容功能组件的显/隐；
- 控制组件原生事件`event`是否生效

## Environment Support
- 暂时只支持vue2.6及以下

## 安装

```bash
$ npm install @gaoding/access-controller
```

```bash
$ yarn add @gaoding/access-controller
```

## 开始使用

### init初始化：
```js
import accessInit from "@gaoding/access-controller/src/index";

accessInit({
    enable: true,
    config: {
        A: true,
        B: false,
    }
});
```

options：

| key | type | Description|
| --- | --- | --- |
| enable | boolean | 用于全局的权限控制是否生效 |
| loaded | boolean | 权限控制的loaded属性，会透传至子组件 |
| config | object | 权限码（key）- 权限（value: true \|\| false） |

### 管理权限registerUserPermission

初始化后，还可以使用registerUserPermission注入权限码

```typescript
import { registerUserPermission } from "@gaoding/access-controller/src/index";

interface Conf {
    [key: sting]: boolean
};

registerUserPermission(config: Conf)

```


### 组件权限控制：
```js
import Test from "./test.vue";
import { accessController } from "@gaoding/access-controller/src/index";
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
```
```html
<template>
    <div>
        <Test />
    </div>
</template>
```

accessController(`params`) -> params可以是string、array、object

string和array分别是简写形式，转成对象应该是
`{
    type: 'display', key: string || array
}`

object: 

| key | type | Description |
| --- | --- | --- |
| enable | boolean | 用于当前的权限控制是否生效（不传时默认使用全局enable） |
| type | string | 类型：display \|\| event， |
| key | string/Array | 权限码（key） |

`type:`

Type: `String`<br>
Default: `display`

`display`用来控制组件的显示/隐藏，`event`可以控制组件内的原生事件(click等)是否生效。


## rightsHandle组件

与editor-design的rightsHandle组件使用方式保持一致



