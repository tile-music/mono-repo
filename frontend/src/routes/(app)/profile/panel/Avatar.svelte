<script lang="ts">
    import { deserialize } from '$app/forms';
    import sampleAvatar from '$lib/assets/images/sample_avatar.jpg';
    import type { ActionResult } from '@sveltejs/kit';

    interface Props {
        url?: string;
        size: number;
    }

    let { url, size }: Props = $props();
    let popupVisible: boolean = $state(false);
    let previewImage: HTMLImageElement | null = $state(null);
    let fileInput: HTMLInputElement | null = $state(null);
    let dragging: boolean = $state(false);
    let changeStatus: string | null = $state(null);
    let removeStatus: string | null = $state(null);

    async function removeAvatar() {
        if (!confirm("Are you sure you want to remove your avatar?"))
            return;

        removeStatus = "removing...";

        const response = await fetch('?/remove_avatar',
            { method: 'POST', headers: { "Content-Type": "multipart/form-data" }}
        );
        const result: ActionResult = deserialize(await response.text());

        if (result.type === 'success') {
            removeStatus = null;
            window.location.reload();
        } else if (result.type === 'failure') {
            if (!result.data) removeStatus = 'failed to remove avatar: unknown error';
            else if (result.data.not_authenticated) removeStatus = 'failed to remove avatar: not authenticated';
            else if (result.data.no_avatar) removeStatus = 'failed to remove avatar: no avatar set';
            else if (result.data.function_error) removeStatus = 'failed to remove avatar: ' + result.data.error;
            else removeStatus = 'failed to remove avatar: unknown error';
        }
    }

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (!previewImage) return;
                previewImage.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function handleDrop(event: DragEvent) {
        event.preventDefault();
        const file = event.dataTransfer?.files?.[0];

        if (file) {
            if (event.dataTransfer?.files?.length !== 1) {
                changeStatus = 'please select only one file';
                return;
            }

            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                changeStatus = 'please select a valid image file (PNG or JPEG)';
                return;
            }

            if (!fileInput) return;
            fileInput.files = event.dataTransfer.files;

            const reader = new FileReader();
            reader.onload = () => {
                if (!previewImage) return;
                previewImage.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    async function changeAvatar(event: SubmitEvent) {
        event.preventDefault();

        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            changeStatus = 'please select a file';
            return;
        }

        const formData = new FormData();
        formData.append('avatar', fileInput.files[0]);
        changeStatus = "uploading...";

        const response = await fetch('?/change_avatar', {
            method: 'POST',
            body: formData
        });
        const result: ActionResult = deserialize(await response.text());

        if (result.type === 'success') {
            popupVisible = false;
            changeStatus = null;
            window.location.reload();
        } else if (result.type === 'failure') {
            if (!result.data) changeStatus = 'failed to change avatar: unknown error';
            else if (result.data.not_authenticated) changeStatus = 'failed to change avatar: not authenticated';
            else if (result.data.function_error) changeStatus = 'failed to change avatar: ' + result.data.error;
            else changeStatus = 'failed to change avatar: unknown error';
        }
    }
</script>

<div id="container" style="width: {size}px; height: {size}px;">
    <img id="avatar" src={url ?? sampleAvatar} alt="">
    <div id="controls">
        <button onclick={() => popupVisible = true}>change</button>
        <button onclick={removeAvatar}>remove</button>
    </div>
</div>
{#if removeStatus}
    <p>{removeStatus}</p>
{/if}
{#if popupVisible}
    <div id="popup-container"
        ondragover={(e: DragEvent) => {
            e.preventDefault();
            dragging = true;
        }}
        ondragleave={() => dragging = false}
        ondrop={handleDrop}
        class:dragging
        role="dialog"
    >
        <div id="popup">
            <h1>change avatar</h1>
            <form
                action="?/change_avatar" onchange={handleFileChange}
                method="POST" onsubmit={changeAvatar}
                enctype="multipart/form-data"
            >
                <div id="instructions">
                    <p>drag and drop a file or</p>
                    <label id="file-label">
                        <input
                            type="file" name="avatar"
                            accept="image/png, image/jpeg"
                            bind:this={fileInput} required
                        >
                        <span>browse</span>
                    </label>
                </div>
                <img bind:this={previewImage} src="" alt="" id="preview">
                <button type="submit" class="art-display-button">change</button>
                <button
                    type="button" id="cancel"
                    onclick={() => popupVisible = false}
                >cancel</button>
                {#if changeStatus}
                    <p>{changeStatus}</p>
                {/if}
            </form>
        </div>
    </div>
{/if}

<style>
    #container {
        position: relative;
    }

    #avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
    }

    #controls {
        position: absolute;
        inset: 0;
        display: none;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    #container:hover #controls {
        display: flex;
    }

    #controls button {
        background-color: transparent;
        border: none;
        outline: none;
        color: var(--accent);
        text-decoration: underline;
        cursor: pointer;
    }

    #popup-container {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #popup-container.dragging {
        background-color: rgba(0, 0, 0, 0.7);
    }

    #popup {
        background-color: var(--midground);
        padding: 20px;
        width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
    }

    #preview {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 50%;
        border: 2px solid var(--text);
    }

    #cancel {
        background-color: transparent;
        border: none;
        outline: none;
        color: var(--accent);
        text-decoration: underline;
        cursor: pointer;
    }

    #file-label input[type="file"] {
        display: none;
    }

    #file-label {
        display: inline-block;
        background-color: transparent;
        border: none;
        outline: none;
        color: var(--accent);
        text-decoration: underline;
        cursor: pointer;
    }

    #file-label span {
        cursor: pointer;
    }

    #instructions {
        display: flex;
        gap: 5px;
    }
</style>