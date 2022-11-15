import { Permission } from './config';

interface Options {
    enable?: boolean;
    loaded?: boolean;
    config: Permission;
    sources?: {
        permission: Promise<string[]> | string[];
        touchPoint:
            | Promise<
                  {
                      type: number;
                      code: string;
                  }[]
              >
            | {
                  type: number;
                  code: string;
              }[];
    };
}

export * from './config';
export { default as accessController } from './hoc';

export { default as AccessHandler } from './components/access-handler.vue';

export default async function init(options: Options) {
    const { registerUserPermission, setEnable, setLoaded, state } = await import('./config');

    if ('enable' in options) {
        setEnable(!!options.enable);
    }

    if ('loaded' in options) {
        setLoaded(!!options.enable);
    }

    /* 优先级： defaultConfig < options.sources < options.config */
    if ('config' in options) {
        registerUserPermission(options.config);
    }

    // @ts-ignore
    window._access_controller = state;
    return state;
}