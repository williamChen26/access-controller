<script lang="ts">
import { computed, PropType, defineComponent } from '../vue-demi/index';
import { useConfig, state, DISABLED_CLASS } from '../config';
import { createEvent } from '../utils/create-mask';
import '../css/disabled.less';

// type CodeStr = keyof Config;

const LOCK_CLASS = 'editor-right-controller--lock';

createEvent(`.${DISABLED_CLASS}`, LOCK_CLASS);

export default defineComponent({
    props: {
        right: {
            type: [String, Array] as PropType<string | string[]>,
            required: true,
        },
    },
    setup(props, { slots }) {
        const { hasAuth, permissions } = useConfig(props.right);
        // const config = inject<RightController | null>(INJECTION_KEY, null);

        function renderDefaultSlots() {
            if (slots.extracts) {
                // 默认状态下 map 里所有值都为 true
                const map = new Proxy(
                    {},
                    {
                        get() {
                            return true;
                        },
                    },
                );

                return slots.extracts?.({ allow: true, loaded: true, map });
            }
            return slots.default?.();
        }

        if (!state.enable) return renderDefaultSlots;

        // { code1: right1, code2: right2 }
        const map = computed(() => {
            return permissions.value;
        });

        return () => {
            if (slots.extracts) {
                const disabledClass = !hasAuth.value ? DISABLED_CLASS : '';

                return slots.extracts?.({
                    allow: hasAuth.value,
                    loaded: state.loaded,
                    map: map.value,
                    disabledClass,
                });
            }
            return hasAuth.value ? slots.default?.() : null;
        };
    },
});
</script>
