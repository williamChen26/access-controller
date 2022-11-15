import { computed, ref } from '../vue-demi/index';
import Vue from 'vue';
import jsep from 'jsep';
import EventEmitter from 'events';


export type ConfigType = { [key: string]: boolean };
export interface State {
    enable: boolean;
    loaded: boolean;
    /** 编辑器的权限点抽象 */
    PERMISSION_MAP: Permission;
    /** 从接口获取的权限点集合 */
    ORIGIN_PERMISSION_MAP: { [key: string]: boolean };
}
interface CompleteParams {
    enable?: boolean;
    action: Action | keyof typeof AuthType;
    code: string | string[];
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

export type Params = string | string[] | CompleteParams;

export type Permission = ConfigType;

enum AuthType {
    'display',
    'event',
    'tips',
    'none',
}

const ee = new EventEmitter();

// 响应式
export const state = Vue.observable<State>({
    enable: false,
    loaded: false,
    ORIGIN_PERMISSION_MAP: {},
    PERMISSION_MAP: {},
});

export function registerUserPermission(rules: Permission) {
    const tempPermission: Permission = {};
    for (let k in rules) {
        tempPermission[k] = rules[k];
        setTimeout(() => {
            ee.emit(k);
        });
    }
    state.PERMISSION_MAP = Object.assign(state.PERMISSION_MAP, tempPermission);
    return state;
}

export function getUserPermission() {
    // 返回只读对象，修改可使用registerUserPermission
    return Object.freeze({ ...state });
}

export function setEnable(v: boolean) {
    state.enable = !!v;
}

export function setLoaded(v: boolean) {
    state.loaded = !!v;
}

export const HOC_AUTH_CLASS = 'auth-controller--identify';

export const DISABLED_CLASS = 'editor-right-controller--disabled';

// js表达式解析
export function lexicalAnalysis(expression: string | string[] = '', permission?: Permission) {
    const perm = permission ?? state.PERMISSION_MAP;
    if (Array.isArray(expression)) {
        // return expression.every((code) => !PERMISSION_MAP.has(code) || PERMISSION_MAP.get(code));
        return expression.every((code) => perm[code] ?? true);
    }
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
                // leftValue = leftTree.value || PERMISSION_MAP.get(leftTree.name);
                leftValue = leftTree.value || perm[leftTree.name];
            }

            if (rightTree.type === 'BinaryExpression') {
                rightValue = analysis(rightTree);
            } else if (rightTree.value || rightTree.name) {
                // rightValue = rightTree.value || PERMISSION_MAP.get(rightTree.name);
                rightValue = rightTree.value || perm[rightTree.name];
            }
            if (parse_tree.operator === '&&') {
                return leftValue && rightValue;
            }
            if (parse_tree.operator === '||') {
                return leftValue || rightValue;
            }
            return false;
        }
        return parse_tree.value || perm[parse_tree.name];
    };

    return analysis(parse_tree);
}

function collectionPermission(expression: string | string[]): string[] {
    if (Array.isArray(expression)) {
        return expression;
    }
    const parse_tree = jsep(expression);
    const permissionArr: string[] = [];
    const getParseNames = <T extends { name: string }, U extends { left: U | T; right: U | T } | T>(
        tree: U,
    ) => {
        'name' in tree && permissionArr.push(tree.name);
        'left' in tree && getParseNames(tree.left);
        'right' in tree && getParseNames(tree.right);
    };
    getParseNames(parse_tree as any);
    return permissionArr;
}

// 配置
const assembleAuth = (data: Params): AuthConfigSheet => {
    const isObject = !(Array.isArray(data) || typeof data === 'string');

    const innerEnable = isObject ? data.enable : state.enable;

    const innerAction: { type: keyof typeof AuthType } = {
        type: 'display',
    };

    if (isObject && typeof data?.action === 'string') {
        innerAction.type = data.action;
    } else if (isObject) {
        Object.assign(innerAction, data.action);
    }

    return {
        enable: innerEnable ?? true,
        action: innerAction,
        code: isObject ? data.code : data,
    };
};

export function useConfig(config?: Params) {
    const permissions = ref<Permission>({});
    const permissionArr = collectionPermission(getAssembleConfig().code as string);

    const updatePermission = (key?: string) => {
        const temp: any = {};
        if (key) {
            temp[key] = state.PERMISSION_MAP[key] ?? false;
        } else {
            permissionArr.forEach((item) => {
                temp[item] = state.PERMISSION_MAP[item] ?? false;
            });
        }
        permissions.value = { ...permissions.value, ...temp };
    };

    permissionArr.forEach((key) => {
        ee.on(key, () => {
            updatePermission(key);
        });
    });

    updatePermission();

    function getAssembleConfig() {
        return assembleAuth(config!);
    }

    // 判断是否有权限（true/false）
    const hasAuth = computed(() => {
        // 当enable为false，或者permissions为空时，则默认有该权限
        if (!state.enable || !Object.keys(permissions.value).length) {
            return true;
        }
        if (Array.isArray(config)) {
            return config.every((code) => permissions.value[code] ?? false);
        } else if (typeof config === 'string') {
            return lexicalAnalysis(config, permissions.value);
        } else if (config instanceof Object) {
            return lexicalAnalysis(config.code, permissions.value);
        }
    });

    return {
        permissions,
        hasAuth,
        getAssembleConfig,
        updatePermission,
    };
}
