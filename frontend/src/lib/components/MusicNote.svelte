<script lang="ts">
    interface Props {
        size?: string | number;
        color?: string;
        class?: string;
    }

    let { 
        size = '2rem',
        color = 'var(--text)',
        class: className = 'logo',
    }: Props = $props();

    // Convert size to CSS value if it's a number
    const sizeValue = typeof size === 'number' ? `${size}px` : size;
</script>

<svg 
    class="logo {className}" 
    style="width: {sizeValue};"
    viewBox="0 0 512 512" 
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Tile Music Logo"
    fill={color}
>
<g>
	<g>
		<path d="M452.295,0.495L185.162,67.278c-7.228,1.808-12.641,8.585-12.641,16.196c0,162.23,0,137.989,0,308.442
			c-13.971-8.424-31.284-13.482-50.087-13.482c-46.033,0-83.479,29.957-83.479,66.783S76.401,512,122.434,512
			c46.033,0,83.479-29.957,83.479-66.783V196.685l233.742-58.435v153.493c-13.972-8.425-31.285-13.484-50.088-13.484
			c-46.033,0-83.479,29.957-83.479,66.783c0,36.827,37.447,66.783,83.479,66.783c46.033,0,83.479-29.957,83.479-66.783
			c0-114.01,0-214.274,0-328.351C473.046,6.018,462.925-2.127,452.295,0.495z"/>
	</g>
</g>
</svg>

<style>
    .logo {
        display: inline-block;
    }
</style>
