import { Component } from 'vue';
import { computed, h, defineComponent } from '../vue-demi/index';
import { useConfig, HOC_AUTH_CLASS, DISABLED_CLASS, state } from '../config';
import type { Params } from '../config';

export default (config: Params) => {
    return (WrappedComponent: Component) => {
        const AuthComponent: Component = defineComponent({
            components: {
                WrappedComponent,
            },
            props: {
                // ...
            },
            setup(props, ctx) {
                const { getAssembleConfig, permissions, hasAuth } = useConfig(config);

                const authOptions = computed(() => {
                    return getAssembleConfig();
                });

                const maps = computed(() => {
                    return permissions.value;
                });

                const cutOffCustom = (...params: any[]) => {
                    const fn = authOptions.value?.action?.execution;
                    const name = authOptions.value?.action?.name;
                    if (hasAuth.value && name) {
                        ctx.emit(name, ...params);
                        return;
                    }
                    // 拦截自定义事件
                    fn && fn(maps.value, ...params);
                };

                const type = authOptions.value.action?.type;

                // props
                const innerProps: any = computed(() => {
                    return Object.assign(props, {
                        auth_show: hasAuth.value,
                        auth_loaded: state.loaded,
                        auth_maps: maps.value,
                        auth_disabledClass: hasAuth.value ? DISABLED_CLASS : '',
                        ...ctx.attrs,
                    });
                });

                // v-on
                const innerEvent = computed(() => {
                    const e: any = {};
                    Object.keys(ctx.listeners).forEach((key) => {
                        e[key] = ctx.listeners[key];
                    });

                    const name = authOptions.value.action?.name;
                    if (type === 'event' && name) {
                        e[name] = cutOffCustom;
                    }
                    return e;
                });

                // slots
                const getInnerSlots = () =>
                    Object.keys(ctx.slots).reduce((arr: any[], key: string) => {
                        return arr.concat(h('template', { slot: key }, ctx.slots[key]!()));
                    }, []);

                // 渲染目标组件的3个条件
                const renderComponent = computed(() => {
                    return (
                        !authOptions.value.enable ||
                        type === 'none' ||
                        (type === 'display' && hasAuth.value) ||
                        type === 'event'
                    );
                });

                return () => {
                    if (renderComponent.value) {
                        return h(
                            WrappedComponent,
                            {
                                on: innerEvent.value,
                                props: innerProps.value,
                                class: HOC_AUTH_CLASS,
                            },
                            getInnerSlots(),
                        );
                    }
                    return null;
                };
            },
        });
        return AuthComponent;
    };
};
