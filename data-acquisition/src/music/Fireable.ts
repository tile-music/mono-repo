/**
 * Represents an object that can execute its persistence workflow.
 */
export interface Fireable {
    /**
     * Executes the object's write side effects.
     */
    fire(): Promise<void>;
}
