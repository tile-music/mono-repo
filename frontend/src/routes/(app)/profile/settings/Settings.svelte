<script lang="ts">
    import LinkSpotify from "../../../link-spotify/spotify.svelte";
    import DeleteUser from "../../delete-account/delete.svelte";
    import { browser } from '$app/environment';
    import ThemeButton from "./ThemeButton.svelte";
    
    interface Props {
        email?: string;
    }
    
    let { email }: Props = $props();
    
    const all_themes = [
    "default-dark", "default-light",
    "faire", "mocha",
    "avocado", "myspace", "beads",
    "spotify"
    ]
    
    let resetProfileStatus = $state("");
    async function resetProfileInformation() {
        // confirm with user
        if (!confirm("Are you sure you want to reset your profile information? " +
        "This action cannot be undone.")) return;
        
        const res = await fetch('?/reset_profile', {
            method: 'POST',
            headers: { "Content-Type": "multipart/form-data" }
        });
        
        // parse response
        const response = await res.json();
        const info = JSON.parse(response.data)[0]; // returns an array, for some reason
        
        // set status message
        if (info.success) {
            // refresh page
            resetProfileStatus = "reset successfully";
            window.location.href = window.location.href;
        }
        else if (info.not_authenticated) resetProfileStatus = "failed: not authenticated";
        else if (info.server_error) resetProfileStatus = "failed: server error";
        else resetProfileStatus = "failed: unknown error";
    }
    
    // very similar to the function above, but i'm keeping it separate
    // to allow for more robust error handling in the future
    let resetListeningStatus = $state("");
    async function resetListeningHistory() {
        // confirm with user
        if (!confirm("Are you sure you want to reset your listening history? " +
        "This action cannot be undone.")) return;
        
        const res = await fetch('?/reset_listening_data', {
            method: 'POST',
            headers: { "Content-Type": "multipart/form-data" }
        });
        
        // parse response
        const response = await res.json();
        const data = JSON.parse(response.data)[0]; // returns an array, for some reason
        
        // set status message
        if (data.success) resetListeningStatus = "reset successfully";
        else if (data.no_action) resetListeningStatus = "no listening data found";
        else if (data.not_authenticated) resetListeningStatus = "failed: not authenticated";
        else if (data.server_error) resetListeningStatus = "failed: server error";
        else resetListeningStatus = "failed: unknown error";
    }
    
    let themeStatus = $state("");
    let themeStatusTimeout: NodeJS.Timeout | null = null;
    async function setProfileTheme(themeType : string) {
        const res = await fetch('?/update_theme', {
            method: 'POST',
            body: JSON.stringify(themeType)
        });
        
        // parse response
        const response = await res.json();
        const info = JSON.parse(response.data)[0]; // returns an array, for some reason
        
        // set status message
        if (info.success) {
            themeStatus = "update successful";
            applyTheme(themeType);
        }
        
        // handle errors
        else if (info.not_authenticated) themeStatus = "failed: not authenticated";
        else if (info.server_error) themeStatus = "failed: server error";
        else if (info.update_unnecessary) themeStatus = "theme already set to that value";
        else themeStatus = "failed: unknown error";

        if (themeStatusTimeout) clearTimeout(themeStatusTimeout);
        themeStatusTimeout = setTimeout(() => {
            themeStatus = "";
        }, 2000); // clear status message after 2 seconds
    }
    
    async function applyTheme(themeType: string) {
        // Set class on html element
        if (browser) {
            document.documentElement.className = 
                document.documentElement.className.replace(
                    /^theme-[^\s]*/, `theme-${themeType}`
                );
        }
    }
</script>

<div id="settings">
    <h1>settings</h1>
    <div>
        <h2>email</h2>
        <p>your email is: <em>{email ?? "[no email found]"}</em>.</p>
    </div>
    <div>
        <h2>linked services</h2>
        <LinkSpotify></LinkSpotify>
    </div>
    <div id="themes">
        <div id="theme-header">
            <h2>theme</h2>
            <p>{themeStatus}</p>
        </div>
        {#each all_themes as theme}
        <ThemeButton color={theme} setTheme={setProfileTheme}> </ThemeButton>
        {/each}
    </div>
    <div id="account-actions">
        <h2>account actions</h2>
        <div class="button-status-group">
            <button class="link-button" onclick={resetListeningHistory}>reset listening history</button>
            <p role="status">{resetListeningStatus}</p>
        </div>
        <div class="button-status-group">
            <button class="link-button" onclick={resetProfileInformation}>reset profile information</button>
            <p role="status">{resetProfileStatus}</p>
        </div>
        <DeleteUser><div id="delete">delete account</div></DeleteUser>
    </div>
</div>

<style>
    #settings {
        width: 50%;
        display: flex;
        flex-direction: column;
        gap: 40px;
        margin: auto;
        overflow-y: scroll;
        max-height: 100%;
    }
    
    #settings>div {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .link-button {
        margin: 0;
        padding: 0;
        border: none;
        font-family: "Archivo";
        background-color: transparent;
        color: var(--accent);
        text-decoration: underline;
        font-size: 16px;
        height: 24px;
        border-radius: 0;
        cursor: pointer;
    }
    
    #delete {
        height: 40px;
        border-radius: 20px;
        border: none;
        cursor: pointer;
        color: var(--background);
        background-color: var(--accent);
        font-family: "Mattone", sans-serif;
        font-size: 15px;
        padding: 0 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .button-status-group {
        display: flex;
        align-items: flex-end;
        gap: 20px;
    }
    
    .button-status-group p {
        margin-bottom: 3px; /* align status message with button */
    }
    
    #themes {
        max-width: 500px; /*This keeps the theme rows adaptabe but won't exceed 3 per row*/
        display: block !important;
        /* yes sam i know you hate !important but it's what works */
    }

    #theme-header {
        display: flex;
        gap: 30px;
        justify-content: flex-start;
        align-items: center;
    }
</style>
