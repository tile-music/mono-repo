<script lang="ts">
    import type { SongInfo } from "$shared/Song";

    interface Props {
        song: SongInfo;
    }

    const { song }: Props = $props();

    const primaryAlbum = $derived(song.albums[0]);

    function durationLabel(ms: number) {
        const s = Math.round(ms / 1000);
        const m = s / 60;
        const h = m / 60;

        const seconds = Math.floor(s % 60);
        const minutes = Math.floor(m % 60);
        const hours = Math.floor(h);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        } else {
            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
    }

    function listenedLabel(tms: number) {
        const now = Date.now();
        const ms_since = now - tms;

        function plural(n: number) {
            return n === 1 ? "" : "s";
        }

        const s_since = ms_since / 1000;
        if (s_since < 60) {
            const s_since_fl = Math.floor(s_since);
            return `${s_since_fl} second${plural(s_since_fl)} ago`;
        }

        const m_since = s_since / 60;
        if (m_since < 60) {
            const m_since_fl = Math.floor(m_since);
            return `${m_since_fl} minute${plural(m_since_fl)} ago`;
        }

        const h_since = m_since / 60;
        if (h_since < 24) {
            const h_since_fl = Math.floor(h_since);
            return `${h_since_fl} hour${plural(h_since_fl)} ago`;
        }

        // minimal date/time, e.g. 19 Jan 8:21PM
        return new Date(tms).toLocaleString(undefined, {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
        });
    }
</script>

<div class="song">
    <img
        class="art"
        src={primaryAlbum.image}
        alt="The album art for {primaryAlbum.title}"
    />
    <div class="basic-information">
        <span class="title">
            <div class="wrappable"><strong>{song.title}</strong></div>
        </span>
        <span class="artists"
            ><div class="wrappable">{song.artists.join(", ")}</div></span
        >
    </div>
    <span class="album"><div class="wrappable">{primaryAlbum.title}</div></span>
    <span class="duration">{durationLabel(song.duration)}</span>
    <span class="listened">{listenedLabel(song.listened_at)}</span>
</div>

<style>
    .song {
        height: 4rem;
        display: flex;
        align-items: center;
        padding: 0.5rem;
        gap: 1rem;
        border-bottom: 1px solid var(--bg-subtle);

        .art {
            aspect-ratio: 1;
            object-fit: cover;
            height: 100%;
        }

        .wrappable {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            line-clamp: 3;
            width: 100%;
            overflow: hidden;
            overflow-wrap: break-word;

            @media (max-width: 700px) {
                -webkit-line-clamp: 2;
                line-clamp: 2;
            }
        }

        .basic-information {
            display: contents;

            .title,
            .artists {
                width: 0;
                flex-grow: 1;
            }

            @media (max-width: 700px) {
                display: flex;
                flex-direction: column;
                flex-grow: 2;
                width: 0;

                .title,
                .artists {
                    width: 100%;
                }
            }
        }

        .album {
            width: 0;
            flex-grow: 1;

            @media (max-width: 600px) {
                display: none;
            }
        }

        .duration {
            flex-shrink: 0;
            width: 4rem;

            @media (max-width: 999px) {
                display: none;
            }
        }

        .listened {
            flex-shrink: 0;
            width: 8rem;
            color: var(--fg-subtle);
        }
    }
</style>
