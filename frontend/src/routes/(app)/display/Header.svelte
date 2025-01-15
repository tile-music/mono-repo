<script lang="ts">
    import type { DisplayDataRequest } from "../../../../../lib/Request";
    import type { DateStrings, TimeFrame } from "./filters";
    import { timeFrameToText } from "./filters";
    
    export let nameSource: "name" | "username";
    export let position: {left: number, top: number};

    export let dateStrings: DateStrings;
    export let timeFrame: TimeFrame;
    export let filters: DisplayDataRequest;

    // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    function toTitleCase(str: string) {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    }

    $: nameText = `${nameSource == "name" ? "[name]" : "[username]"}'s`;
    $: headingText = toTitleCase(`${nameText} top ${filters.aggregate + "s"} ` +
                     timeFrameToText(timeFrame, dateStrings));
</script>

<div id="display-heading"
style="top: {position.top}px; left: {position.left}.px">
    <h1>{headingText}</h1>
</div>

<style>
    #display-heading {
        position: absolute;
        z-index: 1;
    }
</style>