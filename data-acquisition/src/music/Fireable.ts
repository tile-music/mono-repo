
export interface Fireable<T> {
  fire(): Promise<void>;
  validate(): asserts this is T;
}

