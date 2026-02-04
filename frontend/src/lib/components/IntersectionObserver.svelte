<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        onIntersect?: (entry: IntersectionObserverEntry) => void;
        options?: IntersectionObserverInit;
        once?: boolean;
        children?: Snippet<[{ isIntersecting: boolean }]>;
    }

    let { onIntersect, options = {}, once = false, children }: Props = $props();

    let element: HTMLDivElement;

    let isIntersecting = $state(false);

    $effect(() => {
        if (!element) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (onIntersect && entry.isIntersecting) {
                    onIntersect(entry);
                }

                if (once && entry.isIntersecting && observer) {
                    observer.disconnect();
                }
            });
        }, options);

        observer.observe(element);

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    });
</script>

<div bind:this={element}>
    {@render children?.({ isIntersecting })}
</div>
