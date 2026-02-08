<script lang="ts">
    interface Props {
        next: string;
        linkIdentity?: boolean;
    }

    const { next, linkIdentity = false }: Props = $props();
</script>

<a
    href="/oauth/apple/login?next={next}&linkIdentity={linkIdentity
        ? 'true'
        : 'false'}"
    data-sveltekit-preload-data="off"
>
    Log in with Apple Music
</a>
