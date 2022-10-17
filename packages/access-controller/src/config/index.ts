interface Rules {
    [key:string]: string
}

enum AuthType {
    'display',
    'event',
}

interface AuthOption {
    enable?: boolean;
    type?: keyof AuthType;
    key: string | string[];
}

const PERMISSION = new Map();
const DISABLED_CLASS = 'editor-right-controller--disabled';

let enable = false;
let loaded = false;

export function useConfig() {

    function registerUserPermission(rules: Rules) {
        for(let k in rules) {
            PERMISSION.set(k, rules[k]);
        }
    };

    function setEnable(v: boolean) {
        enable = !!v
    };

    function setLoaded(v: boolean) {
        loaded = !!v
    };

    function hasAuth(config: string | string[]): boolean {
        if (Array.isArray(config)) {
            return config.every((code) => !PERMISSION.has(code) || PERMISSION.get(code));
        } else if (typeof config === 'string') {
            return !PERMISSION.has(config) || PERMISSION.get(config);
        }
        return true;
    };

    function getAuthOptions(config: string | string[] | AuthOption) {
        if (Array.isArray(config) || typeof config === 'string') {
            return {
                enable,
                type: 'display',
                auth: hasAuth(config)
            }
        } else if(config instanceof Object) {
            if ('enable' in config && !config.enable) {
                return { enable: false };
            }
            return {
                enable: config.enable,
                type: config.type || 'display',
                auth: hasAuth(config.key),
            }
        }
        return {};
    };

    function authMaps(auth: string | string[]) {
        if (Array.isArray(auth)) {
            return auth.reduce((map, code) => {
                map[code] = !!hasAuth(code);
                return map;
            }, {} as { [key: string]: boolean });
        } else if (auth) {
            return { [auth]: !!hasAuth(auth) };
        } else {
            return {};
        }
    };

    return {
        PERMISSION,
        DISABLED_CLASS,
        enable,
        loaded,
        registerUserPermission,
        setEnable,
        setLoaded,
        hasAuth,
        getAuthOptions,
        authMaps
    }

}
