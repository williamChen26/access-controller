import { Component, CreateElement } from 'vue';
import { useConfig, HOC_AUTH_CLASS, DISABLED_CLASS } from '../config';

export default (auth: string) => {
    return (WrappedComponent: Component) => {
        const { getAuthOptions, authMaps, loaded } = useConfig();
        const AuthComponent: Component = {
            components: {
                WrappedComponent,
            },
            props: {
                //...
            },
            computed: {
                authOptions() {
                    return getAuthOptions(auth);
                },
                map() {
                    return authMaps(auth);
                }
            },
            methods: {
                //...
            },
            render(h: CreateElement) {
                const _this = this as any;

                const props = Object.assign(_this.$props, {
                    auth_show: _this.authOptions.auth,
                    auth_loaded: loaded,
                    auth_map: _this.map,
                    auth_disabledClass: _this.authOptions.auth ? DISABLED_CLASS : '',
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
                
                if (!_this.authOptions.enable || _this.authOptions.action === 'none') {
                    return targetComponent;
                } else if (_this.authOptions.action === 'display') {
                    return _this.authOptions.auth ? targetComponent : null;
                } else if (_this.authOptions.action === 'event') {
                    return _this.authOptions.auth ? h(
                        WrappedComponent,
                        {
                            on: _this.$listeners,
                            attrs: _this.$attrs,
                            props,
                            'class': HOC_AUTH_CLASS,
                            style: {
                                'pointer-events': 'none',
                            },
                            scopedSlots: _this.$scopedSlots,
    
                        },
                        slots,
                    ) : null;
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