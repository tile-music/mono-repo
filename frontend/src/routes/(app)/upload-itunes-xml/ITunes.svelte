<script>
  import { onMount } from 'svelte';
  let file = null;

  async function uploadFile() {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload-itunes-xml', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('File uploaded successfully');
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  }
</script>

<input type="file" accept=".xml" on:change="{(e) => file = e.target.files[0]}" />
<button on:click="{uploadFile}">Upload</button>