import { useConfig } from './config';
import type { Rules } from './config';

interface Options {
    enable?: boolean;
    loaded?: boolean;
    config: Rules;
}

export * from './config';
export {default as accessController} from './hoc';

export {default as RightHandler } from './components/right-handler.vue';

export default function init(options: Options) {
    const { registerUserPermission, setEnable, setLoaded,} = useConfig();

    if ( 'enable' in options ) {
        setEnable(!!options.enable);
    }

    if ( 'loaded' in options ) {
        setLoaded(!!options.enable);
    }

    if ('config' in options) {
        registerUserPermission(options.config);
    }
}