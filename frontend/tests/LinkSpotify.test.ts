import {describe, expect, it} from 'vitest';
import Todo from "./Todo.svelte";

describe("Todo", () => {
    let instance = null;

    beforeEach(() => {
        //create instance of the component and mount it
    })

    afterEach(() => {
        //destory/unmount instance
    })

    test("that the Todo is rendered", () => {
        expect(instance).toBeDefined();
    })
})