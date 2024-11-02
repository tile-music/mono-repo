import { Worker } from 'bullmq';
import { spotifyFire } from '../../src/worker/worker';
import { connection } from '../../src/worker/redis';

jest.mock('bullmq');
jest.mock('../../src/worker/redis');
jest.mock('../../src/worker/worker', () => ({
  ...jest.requireActual('../../src/worker/worker'),
  spotifyFire: jest.fn(),
}));

describe('Worker', () => {
  let worker: Worker;

  beforeEach(() => {
    worker = new Worker(
      'my-cron-jobs',
      async (job: any) => {
        const { userId, refreshToken } = job.data.data;
        await spotifyFire(userId, refreshToken);
        console.log(`Processing job ${job.id} at ${new Date()} for user ${userId}`);
      },
      { connection }
    );
  });

  afterEach(async () => {
    await worker.close();
    jest.clearAllMocks();
  });

  it('should process a job and call spotifyFire with correct parameters', async () => {
    const job = {
      id: '1',
      data: {
        data: {
          userId: 'testUser',
          refreshToken: 'testToken',
        },
      },
    };

    await worker.process(job);

    expect(spotifyFire).toHaveBeenCalledWith('testUser', 'testToken');
  });

  it('should handle unhandledRejection', () => {
    const error = new Error('Unhandled rejection');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    process.emit('unhandledRejection', error);

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);

    consoleErrorSpy.mockRestore();
  });

  it('should handle SIGINT and close the worker gracefully', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    process.emit('SIGINT');

    expect(worker.close).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith('Worker and queue closed');
    expect(processExitSpy).toHaveBeenCalledWith(0);

    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
  });
});