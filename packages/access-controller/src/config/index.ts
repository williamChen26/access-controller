import jsep from 'jsep';

interface CompleteParams {
    enable: boolean;
    action: Action | keyof typeof AuthType;
    code: string | string[];
    props?: { [key:string]: string };
}

interface AuthConfigSheet {
    enable: boolean;
    action: Action;
    auth: boolean;
}

interface Action {
    type: keyof typeof AuthType;
    name?: string;
    execution?: Function;
}

export type  Params = string | string[] | CompleteParams;

export interface Rules {
    [key:string]: boolean
}

enum AuthType {
    'display',
    'event',
    'tips',
    'none',
}


const PERMISSION_MAP = new Map();

export const HOC_AUTH_CLASS = 'auth-controller--identify';

export const DISABLED_CLASS = 'editor-right-controller--disabled';

let enable = false;
let loaded = false;

// js表达式解析
function lexicalAnalysis(expression: string | string[] = '') {
    if (Array.isArray(expression)) {
        return expression.every((code) => !PERMISSION_MAP.has(code) || PERMISSION_MAP.get(code));
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
                leftValue = leftTree.value || PERMISSION_MAP.get(leftTree.name)
            }

            if (rightTree.type === 'BinaryExpression') {
                rightValue = analysis(rightTree);
            } else if (rightTree.value || rightTree.name) {
                rightValue = rightTree.value || PERMISSION_MAP.get(rightTree.name)
            }
            if (parse_tree.operator === '&&') {
                return leftValue && rightValue;
            }
            if (parse_tree.operator === '||') {
                return leftValue || rightValue;
            }
            return false;
        }
        return parse_tree.value || PERMISSION_MAP.get(parse_tree.name);
    }
    const auth = analysis(parse_tree);
    return analysis(parse_tree);
}

function collectionPermission(expression: string): string[] {
    const parse_tree = jsep(expression);
    const permissionArr: string[] = [];
    const getParseNames = <T extends { name: string }, U extends { left: U | T, right: U | T } | T>(tree: U) => {

        'name' in tree && permissionArr.push(tree.name);
        'left' in tree && getParseNames(tree.left);
        'right' in tree && getParseNames(tree.right);
    }
    getParseNames(parse_tree as any);
    return permissionArr;
}

// 配置
const assembleAuth = (data: Params): AuthConfigSheet => {
    const isObject = !(Array.isArray(data) || typeof data === 'string');

    const innerEnable = isObject ? data.enable : enable;

    const innerAction: { type: keyof typeof AuthType } = {
        type: 'display',
    }
    const auth = isObject ? lexicalAnalysis(data.code) : lexicalAnalysis(data);

    if (isObject && typeof data?.action === 'string') {
        innerAction.type = data.action;
    } else if (isObject) {
        Object.assign(innerAction, data.action)
    }

    return {
        enable: innerEnable,
        action: innerAction,
        auth,
    };
    
}

export function useConfig(config?: Params) {
    function registerUserPermission(rules: Rules) {
        for(let k in rules) {
            PERMISSION_MAP.set(k, rules[k]);
        }
    };

    function setEnable(v: boolean) {
        enable = !!v
    };

    function setLoaded(v: boolean) {
        loaded = !!v
    };

    function getAuth() {
        return assembleAuth(config!);
    }

    function getPermission(v: string) {
        return PERMISSION_MAP.get(v);
    }

    // 判断权限值
    function hasAuth(config: Params): boolean {
        if (Array.isArray(config)) {
            return config.every((code) => !PERMISSION_MAP.has(code) || PERMISSION_MAP.get(code));
        } else if (typeof config === 'string') {
            return !PERMISSION_MAP.has(config) || PERMISSION_MAP.get(config);
        } else if(config instanceof Object) {
            return lexicalAnalysis(config.code);
        }
        return true;
    };

    function authMaps(auth: Params) {
        let options: any = {};

        if (Array.isArray(auth)) {
            options = auth.reduce((map, code) => {
                map[code] = !!hasAuth(code);
                return map;
            }, {} as { [key: string]: boolean });
        } else if (typeof auth === 'string') {
            collectionPermission(auth).forEach((item) => {
                options[item] = hasAuth(item)
            })
        }
        return options;
    };

    return {
        PERMISSION_MAP,
        enable,
        loaded,
        registerUserPermission,
        setEnable,
        setLoaded,
        getPermission,
        hasAuth,
        getAuth,
        authMaps
    }

}
