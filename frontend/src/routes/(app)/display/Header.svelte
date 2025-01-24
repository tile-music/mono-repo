<script lang="ts">
    import type { DisplayDataRequest } from "../../../../../lib/Request";
    import type { DateStrings, TimeFrame } from "./filters";
    import { timeFrameToText } from "./filters";
    

    interface Props {
        nameSource: "name" | "username";
        position: {left: number, top: number};
        dateStrings: DateStrings;
        timeFrame: TimeFrame;
        filters: DisplayDataRequest;
    }

    let {
        nameSource,
        position,
        dateStrings,
        timeFrame,
        filters
    }: Props = $props();

    // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    function toTitleCase(str: string) {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    }

    let nameText = $derived(`${nameSource == "name" ? "[name]" : "[username]"}'s`);
    let headingText = $derived(toTitleCase(`${nameText} top ${filters.aggregate + "s"} ` +
                     timeFrameToText(timeFrame, dateStrings)));
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