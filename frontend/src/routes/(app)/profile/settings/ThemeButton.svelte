<script lang="ts">
    interface Props {
        color: string;
        setTheme: (themeType : string) => void;
    }

    let { color, setTheme}: Props = $props();

    function parseName() {
        var split_name = color.split("-");
        if (split_name[0] == "default") {
            return split_name[1];
        } else {
            var name = "";
            split_name.forEach(n => {
                name = name + " " + n;
            });
            return name;
        }
    }
</script>

<button onclick={() => setTheme(color)} class={"theme theme-" + color}>
    <p class="theme-text">{parseName()}</p>
    <div class="inner-theme"></div>
</button>   

<style>
    .theme {
        width: 110px;
        height: 45px;
        border-radius: 10px;
        margin-right: 20px;
        margin-top: 10px;
        cursor: pointer;
        display: inline-block;
        background-color: var(--background);
        border: 3px solid var(--accent);
    }

    .theme-text {
        font-family: "Mattone", sans-serif;
        font-size: 17px;
        padding-top: 3px;
        color: var(--text);
    }

    .inner-theme {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 15px;
        background-color: var(--accent)
    }
</style>