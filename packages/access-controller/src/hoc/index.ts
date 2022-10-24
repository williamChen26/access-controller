import { Component } from 'vue';
import { computed, h, defineComponent, watch } from '@vue/composition-api';
import { useConfig, HOC_AUTH_CLASS, DISABLED_CLASS, state } from '../config';
import type { Params } from '../config';

export default (config: Params) => {
    return (WrappedComponent: Component) => {
        const AuthComponent: Component = defineComponent({
            components: {
                WrappedComponent,
            },
            setup(props, ctx) {
                const { getAssembleConfig, permissions, hasAuth, updatePermission } = useConfig(config);

                const authOptions = computed(() => {
                    return getAssembleConfig();
                });

                // 响应式
                watch(state, () => {
                    updatePermission();
                });

                const maps = computed(() => {
                    return permissions.value;
                });

                const cutOffCustom = (...params: any[]) => {
                    const fn = authOptions.value?.action?.execution;
                    const name = authOptions.value?.action?.name!;

                    if (hasAuth.value) {
                        ctx.emit(name, ...params);
                        return;
                    }
                    // 拦截自定义事件
                    fn && fn(maps.value, ...params);
                }

                const permissionProps = computed(() => {
                    const tempProps: any = {};
                    // 透传的props
                    if (typeof config === 'object' && 'props' in config) {
                        for (let key in config.props) {
                            tempProps[key] = state.PERMISSION_MAP[config.props[key]] || false;
                            console.log(config.props[key]);
                        }
                    }
                    return tempProps;
                });

                const type = authOptions.value.action?.type;

                // props
                const innerProps: any = computed(() => {
                    return Object.assign(props, {
                        auth_show: hasAuth.value,
                        auth_loaded: state.loaded,
                        auth_maps: maps.value,
                        auth_disabledClass: hasAuth.value ? DISABLED_CLASS : '',
                        ...permissionProps.value,
                    })
                });

                // v-on
                const innerEvent = computed(() => {
                    const e: any = {};
                    Object.keys(ctx.listeners).forEach((key) => {
                        e[key] = ctx.listeners[key];
                    })

                    const name = authOptions.value.action?.name!;
                    e[name] = cutOffCustom;

                    return e;
                });

                // slots
                const getInnerSlots = () => Object.keys(ctx.slots).reduce((arr: any[], key: string) => {
                    return arr.concat(h('template', { slot: key }, ctx.slots[key]!()));
                }, []);

                // 渲染目标组件的3个条件
                const renderComponent = computed(() => {
                    return (!authOptions.value.enable || type === 'none') ||
                        (type === 'display' && hasAuth.value) ||
                        type === 'event';
                });

                return () => {
                    if (renderComponent.value) {
                        return h(
                            WrappedComponent,
                            {
                                on: innerEvent.value,
                                props: innerProps.value,
                                'class': HOC_AUTH_CLASS,
                            },
                            getInnerSlots(),
                        )
                    }
                }

            },
        });
        return AuthComponent;
    }
}