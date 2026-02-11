<script lang="ts">
    import type { Database } from "$shared/schema";
    import sampleAvatar from "$lib/assets/images/sample_avatar.jpg";

    interface Props {
        profile: Database["public"]["Tables"]["profiles"]["Row"];
        size: number | string;
    }

    const { profile, size }: Props = $props();
    const sizeString = $derived(typeof size === "number" ? size + "px" : size);

    function initials(name: string | null) {
        if (!name) return "t.m";
        const words = name.split(" ").filter((part) => part.length > 0);
        const initialsArray = words.map((part) => part.charAt(0).toUpperCase());
        return initialsArray.join("");
    }
</script>

<div class="icon" style:--size={sizeString}>
    {#if profile.username !== "" || profile.name !== ""}
        {@const text = initials(
            profile.name !== "" || profile.name === null
                ? profile.name
                : profile.username,
        )}
        <span style:--length={text.length}>{text}</span>
    {:else}
        <img src={sampleAvatar} alt="Generic user icon" />
    {/if}
</div>

<style>
    .icon {
        border-radius: 50%;
        color: var(--fg);
        background-color: var(--bg-subtle);
        border: 1px solid var(--border);
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--size);
        height: var(--size);
        overflow: clip;
        flex-shrink: 0;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        span {
            font-size: calc(var(--size) * 0.4 * pow(0.85, var(--length)));
            font-family: "Mattone";
        }
    }
</style>
