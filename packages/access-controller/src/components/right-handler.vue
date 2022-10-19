<script lang="ts">
import { computed, PropType, defineComponent } from '../vue-demi/index';
import { useConfig, DISABLED_CLASS } from '../config';
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
        const { enable, loaded, hasAuth, authMaps } = useConfig();
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

        if (!enable) return renderDefaultSlots;

        const show = computed(() => {
            return hasAuth(props.right);
        });

        // { code1: right1, code2: right2 }
        const map = computed(() => {
            return authMaps(props.right);
        });

        return () => {
            if (slots.extracts) {
                const disabledClass = !show.value ? DISABLED_CLASS : '';

                return slots.extracts?.({
                    allow: show.value,
                    loaded,
                    map: map.value,
                    disabledClass,
                });
            }
            return show.value ? slots.default?.() : null;
        };
    },
});
</script>
