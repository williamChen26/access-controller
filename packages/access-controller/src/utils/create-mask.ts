let $maskDom: any = null;

export function createMask(maskDom: HTMLElement, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const offset = {
        left: target.offsetLeft,
        top: target.offsetTop,
    };
    target?.offsetParent?.appendChild(maskDom);
    maskDom.style.cssText = `
        display: block;
        position: absolute;
        left: ${offset.left}px;
        top: ${offset.top}px;
        width: ${rect.width}px;
        height:${rect.height}px;
        z-index: 10000000
    `;
    return maskDom;
}

export function createEvent(eleStr: string, className: string) {
    if (!$maskDom) {
        $maskDom = document.createElement('div');
        $maskDom.setAttribute('className', className);
    }
    const nodeList = document.querySelectorAll(eleStr);
    nodeList.forEach((node) => {
        node.addEventListener('mouseenter', function (e) {
            const target = e.currentTarget as HTMLElement;
            $maskDom.setAttribute('className', className);
            createMask($maskDom, target);
        });
        node.addEventListener('mouseleave', function () {
            $maskDom.style.display = 'none';
        });
    });
}
