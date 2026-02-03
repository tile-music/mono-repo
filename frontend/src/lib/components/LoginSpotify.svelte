<script lang="ts">
    interface Props {
        next: string;
        linkIdentity?: boolean;
    }

    const { next, linkIdentity = false }: Props = $props();
</script>

<a
    href="/oauth/spotify/login?next={next}&linkIdentity={linkIdentity
        ? 'true'
        : 'false'}"
    data-sveltekit-preload-data="off"
>
    Log in with Spotify
</a>
