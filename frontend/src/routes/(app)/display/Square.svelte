<script lang="ts">
    type squareInfo = {
        x: number
        y: number
        size: number
    };

    export let square: squareInfo;

    function percent(decimal: number) {
        return 100*decimal + "%";
    }

    $: style = `
        left: ${percent(square.x)};
        top: ${percent(square.y)};
        width: ${percent(square.size)};
        height: ${percent(square.size)};
    `
</script>

<div id="square" style={style}></div>

<style>
    #square {
        z-index: 0;
        position: absolute;
        background-color: white;
        border: 2px solid black;
        outline: 1px solid black;
        box-sizing: border-box;
        transition: transform ease-in 0.2s, z-index linear 0.2s;
    }

    #square:hover {
        z-index: 10;
        transform: scale(1.3);
        transition: transform ease-out 0.2s, z-index linear 0.2s;
    }
</style>