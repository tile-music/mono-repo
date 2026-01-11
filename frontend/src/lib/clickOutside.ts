export function clickOutside(node: Element) {
    const handleClick = (event: Event) => {
        if (!node.contains(<Node>event.target)) {
            node.dispatchEvent(new CustomEvent("outclick"));
        }
    };

    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        },
    };
}
