class _TrackRecordings {
    constructor(private track: Track) {}

    public async getRecordings(): Promise<Recording[]> {
        const recordings = await this.track.getRecordings();
        return recordings;
    }
}
