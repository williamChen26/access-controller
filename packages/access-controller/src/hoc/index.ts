import { Component, CreateElement } from 'vue';
import { useConfig, HOC_AUTH_CLASS, DISABLED_CLASS } from '../config';
import type { Params } from '../config';

export default (config: Params) => {
    return (WrappedComponent: Component) => {
        const { getAuth, authMaps, getPermission, loaded } = useConfig(config);
        const AuthComponent: Component = {
            components: {
                WrappedComponent,
            },
            props: {
                //...
            },
            computed: {
                authOptions() {
                    return getAuth();
                },
                maps() {
                    let permission = config;
                    if (typeof config !== 'string' && 'code' in config) {
                        permission = config.code;
                    }
                    return authMaps(permission);
                }
            },
            methods: {
                cutOffCustom(...params: any[]) {
                    const authOptions = (this as any).authOptions
                    const fn = authOptions?.action?.execution;
                    
                    fn && fn((this as any).maps, ...params);
                }
            },
            render(h: CreateElement) {
                const _this = this as any;
                const permissionProps: { [key: string]: boolean } = {};
                
                // 透传props
                if (typeof config === 'object' && 'props' in config) {
                    for (let key in config.props) {
                        permissionProps[key] = getPermission(config.props[key]) || false;
                    }
                }
                const props = Object.assign(_this.$props, {
                    auth_show: _this.authOptions.auth,
                    auth_loaded: loaded,
                    auth_maps: _this.maps,
                    auth_disabledClass: _this.authOptions.auth ? DISABLED_CLASS : '',
                    ...permissionProps,

                });
                
                const slots = Object.keys(_this.$slots).reduce((arr: any[], key: string) => {
                    return arr.concat(h('template', { slot: key }, _this.$slots[key]));
                }, []);

                const targetComponent = h(
                    WrappedComponent,
                    {
                        on: _this.$listeners,
                        attrs: _this.$attrs,
                        props,
                        'class': HOC_AUTH_CLASS,
                        scopedSlots: _this.$scopedSlots,

                    },
                    slots,
                );
                const type = _this.authOptions.action?.type;
                if (!_this.authOptions.enable || type === 'none') {
                    return targetComponent;
                } else if (type === 'display') {
                    return _this.authOptions.auth ? targetComponent : null;
                } else if (type === 'event') {
                    const name = _this.authOptions.action?.name;
                    if (!name) {
                        return targetComponent;
                    }
                    Object.assign(_this.$listeners, {
                        [name]: _this.cutOffCustom,
                    })

                    return h(
                        WrappedComponent,
                        {
                            on: _this.$listeners,
                            attrs: _this.$attrs,
                            props,
                            'class': HOC_AUTH_CLASS,
                            scopedSlots: _this.$scopedSlots,
    
                        },
                        slots,
                    );
                } else if (_this.authOptions.action === 'tips'){
                    // TODO:待补充
                    return null
                }
                return null;
            },
        };
        return AuthComponent;
    }
}