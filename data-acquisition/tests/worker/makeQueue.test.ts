import { Queue } from 'bullmq';
import { makeQueue } from '../../src/worker/makeQueue';
import { connection } from '../../src/worker/redis';

describe('makeQueue', () => {
  let queue: Queue;

  beforeAll(() => {
    queue = makeQueue();
  });

  afterAll(async () => {
    await queue.close();
  });

  it('should create a queue with the correct name', () => {
    expect(queue.name).toBe('my-cron-jobs');
  });

  it('should use the correct connection', () => {
    expect(queue.opts.connection).toBe(connection);
  });

  it('should have the correct default job options', () => {
    expect(queue.opts.defaultJobOptions).toEqual({
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  });

  it('should create a queue instance of Queue', () => {
    expect(queue).toBeInstanceOf(Queue);
  });
});