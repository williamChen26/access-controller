<script lang="ts">
import { computed, PropType, defineComponent } from '../vue-demi/index';
import { useConfig } from '../config';
import '../css/disabled.less';

// type CodeStr = keyof Config;

const LOCK_CLASS = 'editor-right-controller--lock';

const { DISABLED_CLASS } = useConfig();

function createEvent() {
    let $maskDom: any = null;
    const nodeList = document.querySelectorAll(`.${DISABLED_CLASS}`);
    nodeList.forEach((node) => {
        node.addEventListener('mouseenter', function (e) {
            const target = e.currentTarget as HTMLElement;
            const rect = target.getBoundingClientRect();
            const offset = {
                left: target.offsetLeft,
                top: target.offsetTop,
            };
            if (!$maskDom) {
                $maskDom = document.createElement('div');
                $maskDom.setAttribute('className', LOCK_CLASS);
            }
            target?.offsetParent?.appendChild($maskDom);

            $maskDom.show().css({
                left: offset.left + 'px',
                top: offset.top + 'px',
                width: rect.width + 'px',
                height: rect.height + 'px',
            });
        });
        node.addEventListener('mouseleave', function () {
            $maskDom.hide();
        });
    })
}

createEvent();

export default defineComponent({
    props: {
        right: {
            type: [String, Array] as PropType<string | string[]>,
            required: true,
        },
    },
    setup(props, { slots }) {
        const { DISABLED_CLASS, enable, loaded, hasAuth, authMaps } = useConfig();
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
