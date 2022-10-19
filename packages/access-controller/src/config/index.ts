import jsep from 'jsep';

interface AuthConfigSheet {
    enable: boolean;
    action: keyof AuthType;
    code: string | string[];
}

type  AuthConfig = string | string[] | AuthConfigSheet;

interface Rules {
    [key:string]: string
}

enum AuthType {
    'display',
    'event',
    'tips',
    'none',
}

interface AuthOption {
    enable?: boolean;
    type?: keyof AuthType;
    key: string | string[];
}

const PERMISSION = new Map();


export const HOC_AUTH_CLASS = 'auth-controller--identify';

export const DISABLED_CLASS = 'editor-right-controller--disabled';

let enable = false;
let loaded = false;

// js表达式解析
function lexicalAnalysis(expression: string | string[] = '') {
    if (Array.isArray(expression)) {
        return expression.every((code) => !PERMISSION.has(code) || PERMISSION.get(code));
    };
    const parse_tree = jsep(expression);
    const analysis = (parse_tree: any): boolean => {
        const leftTree = parse_tree.left;
        const rightTree = parse_tree.right;

        let leftValue = false;
        let rightValue = false;

        if (parse_tree.type === 'BinaryExpression') {
            if (leftTree.type === 'BinaryExpression') {
                leftValue = analysis(leftTree);
            } else if (leftTree.value || leftTree.name) {
                leftValue = leftTree.value || PERMISSION.get(leftTree.name)
            }

            if (rightTree.type === 'BinaryExpression') {
                rightValue = analysis(rightTree);
            } else if (rightTree.value || rightTree.name) {
                rightValue = rightTree.value || PERMISSION.get(rightTree.name)
            }
            if (parse_tree.operator === '&&') {
                return leftValue && rightValue;
            }
            if (parse_tree.operator === '||') {
                return leftValue || rightValue;
            }
            return false;
        }
        return parse_tree.value || PERMISSION.get(parse_tree.name);
    }
    return analysis(parse_tree);
}

// 简写转默认配置
const supplement = (data: string | string[]) => {
    return {
        enable,
        action: 'display',
        auth: lexicalAnalysis(data)
    }
}

// 单权限语法糖 --VIEW --

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
    // 判断权限值
    function hasAuth(config: string | string[] | AuthConfigSheet): boolean {
        if (Array.isArray(config)) {
            return config.every((code) => !PERMISSION.has(code) || PERMISSION.get(code));
        } else if (typeof config === 'string') {
            return !PERMISSION.has(config) || PERMISSION.get(config);
        } else if(config instanceof Object) {
            return lexicalAnalysis(config.code);
        }
        return true;
    };

    // 获取权限option
    function getAuthOptions(config: string | string[] | AuthConfigSheet) {
        if (Array.isArray(config) || typeof config === 'string') {
            return supplement(config);
        } else if(config instanceof Object) {
            if ('enable' in config && !config.enable) {
                return { enable: false };
            }
            return {
                enable: config.enable,
                action: config.action || 'display',
                auth: lexicalAnalysis(config.code),
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
