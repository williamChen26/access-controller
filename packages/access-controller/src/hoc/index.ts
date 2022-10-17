import { Component, CreateElement } from 'vue';
import { useConfig } from '../config';

export default (auth: string) => {
    return (WrappedComponent: Component) => {
        const { DISABLED_CLASS, getAuthOptions, authMaps, loaded } = useConfig();
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
                if (
                    !_this.authOptions.enable ||
                    !(_this.authOptions.type === 'display') ||
                    (_this.authOptions.enable && _this.authOptions.auth)
                ) {
                    let style = {};
                    const props = Object.assign(_this.$props, {
                        auth_show: _this.authOptions.auth,
                        auth_loaded: loaded,
                        auth_map: _this.map,
                        auth_disabledClass: _this.authOptions.auth ? DISABLED_CLASS : '',
                    });
                    console.log(_this.authOptions);
                    if (_this.authOptions.type === 'event' && !_this.authOptions.auth) {
                        style = {
                            'pointer-events': 'none'
                        }
                    }
                    return h(
                        WrappedComponent,
                        {
                            on: _this.$listeners,
                            attrs: _this.$attrs,
                            props,
                            style,
                            scopedSlots: _this.$scopedSlots,

                        },
                        Object.keys(_this.$slots).reduce((arr: any[], key: string) => {
                            return arr.concat(h('template', { slot: key }, _this.$slots[key]));
                        }, []),
                    );
                };
                return null;
            },
        };
        return AuthComponent;
    }
}