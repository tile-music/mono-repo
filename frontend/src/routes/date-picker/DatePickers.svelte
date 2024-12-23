<script lang="ts">
  import {Datepicker, P} from 'flowbite-svelte';
  import type {ListeningDataReqPerams} from '../../../../lib/ListeningDataReqPerams'
  type NullableDate = Date | null;
  let dateBeginWindow: NullableDate = null;
  let dateEndWindow: NullableDate = null;
  export let dateRangeObj: ListeningDataReqPerams | null = null;
  const makeReqObj = (dateWindowBegin : NullableDate, dateWindowEnd : NullableDate) : ListeningDataReqPerams => {
    return {
      beginWindow: dateWindowBegin ? dateWindowBegin.valueOf() : null,
      endWindow: dateWindowEnd ? dateWindowEnd.valueOf() : null
    } as ListeningDataReqPerams;
  };
  $: dateRangeObj = makeReqObj(dateBeginWindow, dateEndWindow);

</script>

<div class="mb-64 md:w-1/2">
  <Datepicker bind:value={dateBeginWindow} />
  <P class="mt-4">Selected date: {dateBeginWindow ? dateBeginWindow.toLocaleDateString() : 'None'}</P>
  <Datepicker bind:value={dateEndWindow} />
  <P class="mt-4">Selected date: {dateEndWindow ? dateEndWindow.toLocaleDateString() : 'None'}</P>
</div>

<style>
  
</style>