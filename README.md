# tile.music

tile.music is a work-in-progress music listening habit visualization platform. It allows users to track their listening history and explore their listening habits through customizable, interactive posters to download, print, and share. It currently supports Spotify, with plans to expand support to Apple Music, Last.fm, and manual tracking.

Unfortunately, due to recent changes in Spotify's developer terms, we are unable to offer Spotify support though our hosted service. For Spotify users who'd still like to use our app please see self hosing instructions. 

## Technologies

tile.music is built on top of [Supabase](https://github.com/supabase/supabase) using [SvelteKit](https://github.com/sveltejs/kit) for the user-facing application, with metadata powered by [MusicBrainz](https://musicbrainz.org/). It also features custom-built libraries, such as [Munite](https://github.com/tile-music/munite) for metadata matching and [Chamfer](https://github.com/notsoli/chamfer) for the customization engine.

## Usage

Before doing anything please insure that you have Docker installed. Instructions on how to install Docker can be found here [Docker Engine Install Instructions](https://docs.docker.com/engine/install). If you are hosting this on a personal computer (not dedicated server) you may be better off with Docker Desktop [Docker Desktop Install Instructions]. Docker Desktop makes viewing logs and managing containers a bit easier. Please note that this service works best on a computer that can be left on 24/7, or at least on while you are listening to music.

tile.music in its full capacity is not yet available, but a preview of its functionality can be found at [tile.music](https://tile.music).

We made this project open source so that people could host their own instance. If you have more than 4 users we recomend setting up a MusicBrains instance. [decide wether we host mb and tm under same docker compose]

To host a local instance with Apple Music support you will need to purchase an Apple developer license for $99. Spotify allows users with a premium account to create a developer token. 

### Env Setup

This project, like many, uses .env files for configuration centralization and protection of sensitive keys. This project is probably not the best place to start if you haven't dealt with environment files. 

## License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl-3.0.en.html).
