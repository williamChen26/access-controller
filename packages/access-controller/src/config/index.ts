import { computed, ref } from '@vue/composition-api';
import Vue from 'vue';
import jsep from 'jsep';

interface CompleteParams {
    enable?: boolean;
    action: Action | keyof typeof AuthType;
    code: string | string[];
    props?: { [key:string]: string };
}

interface AuthConfigSheet {
    enable: boolean;
    action: Action;
    code: string | string[];
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

// export const PERMISSION_MAP = Vue.observable(new Map());
export const state = Vue.observable<{ [key: string]: any }>({
    enable: false,
    loaded: false,
    PERMISSION_MAP: {},
});

export function registerUserPermission(rules: Rules) {
    const temp: {[key: string]: boolean} = {};
    for(let k in rules) {
        // PERMISSION_MAP.set(k, rules[k]);
        temp[k] = rules[k];
    }
    state.PERMISSION_MAP = temp
};

export function setEnable(v: boolean) {
    state.enable = !!v
};

export function setLoaded(v: boolean) {
    state.loaded = !!v
};

export const HOC_AUTH_CLASS = 'auth-controller--identify';

export const DISABLED_CLASS = 'editor-right-controller--disabled';

// js表达式解析
export function lexicalAnalysis(expression: string | string[] = '') {
    if (Array.isArray(expression)) {
        // return expression.every((code) => !PERMISSION_MAP.has(code) || PERMISSION_MAP.get(code));
        return expression.every((code) => state.PERMISSION_MAP[code] ?? true);
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
                // leftValue = leftTree.value || PERMISSION_MAP.get(leftTree.name)
                leftValue = leftTree.value || state.PERMISSION_MAP[leftTree.name]
            }

            if (rightTree.type === 'BinaryExpression') {
                rightValue = analysis(rightTree);
            } else if (rightTree.value || rightTree.name) {
                rightValue = rightTree.value || state.PERMISSION_MAP[rightTree.name]
            }
            if (parse_tree.operator === '&&') {
                return leftValue && rightValue;
            }
            if (parse_tree.operator === '||') {
                return leftValue || rightValue;
            }
            return false;
        }
        return parse_tree.value || state.PERMISSION_MAP[parse_tree.name];
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

    const innerEnable = isObject ? data.enable : state.enable;

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
        code: isObject ? data.code : data,
    };
    
}

export function useConfig(config?: Params) {
    const permissions = ref<{ [key: string]: boolean }>({});

    function getAssembleConfig() {
        return assembleAuth(config!);
    }

    // 判断是否有权限（true/false）
    const hasAuth = computed(() => {
        if (!Object.keys(permissions.value).length) {
            return true;
        }
        if (Array.isArray(config)) {
            return config.every((code) => permissions.value[code] ?? true);
        } else if (typeof config === 'string') {
            return permissions.value[config] ?? true;
        } else if(config instanceof Object) {
            return lexicalAnalysis(config.code);
        }
        return true;
    });

    const updatePermission = () => {
        const temp: any = {};
        collectionPermission(getAssembleConfig().code as string).forEach((item) => {
            // permissions[item] = PERMISSION_MAP.get(item);
            temp[item] = state.PERMISSION_MAP[item];
        });
        permissions.value = temp;
    };
    return {
        PERMISSION_MAP: state.PERMISSION_MAP,
        enable: state.enable,
        loaded: state.loaded,
        permissions,
        hasAuth,
        getAssembleConfig,
        updatePermission,
    }

}
