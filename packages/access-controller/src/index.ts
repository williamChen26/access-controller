import type { Rules } from './config';
import Vue from "vue";

interface Options {
    enable?: boolean;
    loaded?: boolean;
    config: Rules;
}

export * from './config';
export {default as accessController} from './hoc';

export {default as RightHandler } from './components/right-handler.vue';

export default async function init(options: Options) {
    const { registerUserPermission, setEnable, setLoaded } = await import('./config');

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