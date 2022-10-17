import { useConfig } from './config';

export * from './config';
export {default as accessController} from './hoc';

export {default as RightHandler } from './components/right-handler.vue';

export default function init(options: any) {
    const { registerUserPermission, setEnable, setLoaded,} = useConfig();

    if ( 'enable' in options ) {
        setEnable(options.enable);
    }

    if ( 'loaded' in options ) {
        setLoaded(options.enable);
    }

    if ('config' in options) {
        registerUserPermission(options.config);
    }
}