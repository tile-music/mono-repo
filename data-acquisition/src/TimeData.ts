export class TimeData {
  private lastUpdated : Date;
  /* this field represents how long the data aqirerer should wait */
  private timeDiffMs: number = 30000
  private now: Date;
  constructor(){
    this.now = new Date();
    this.lastUpdated = new Date();
  }
  /**
   * 
   * @returns true if the time difference between the last update and now is greater than the time difference
   */
  public isTimeToUpdate(): boolean {
    this.now = new Date();
    return this.now.getTime() - this.lastUpdated.getTime() >= this.timeDiffMs;
  }
  /**
   * resets the last updated time to the current time
   */
  public reset() : void {
    this.lastUpdated = new Date();
    this.now = new Date();
  }
  public alterDelay(time: number) {
    this.timeDiffMs = time;
  }
  
}