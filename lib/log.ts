/**
 * Logs a message with a specified log level.
 *
 * @param level - The log level of the message to be logged. 
 *                Levels are defined as follows:
 *                0 - ALERT
 *                1 - CRITICAL
 *                2 - ERROR
 *                3 - WARNING
 *                4 - NOTICE
 *                5 - INFO
 *                6 - DEBUG
 * @param setLevel - The current log level setting. Messages with a level higher than this will not be logged.
 * @param service - The name of the service generating the log message.
 * @param message - The log message to be recorded.
 *
 * @throws Will throw an error if an inappropriate log level is passed.
 */
export function log(level: number, setLevel: number, service: string, message: string) : void{
  if(level > setLevel) return

  const logLeveltoLogText = (level: number) =>  {
    switch(level){
      case 0:
        return "!ALERT!: ";
      case 1:
        return "CRITICAL: ";
      case 2:
        return "ERROR: ";
      case 3:
        return "WARNING: ";
      case 4:
        return "NOTICE: ";
      case 5:
        return "INFO: ";
      case 6:
        return "DEBUG: ";
      default:
        throw new Error("Inappropriate log level passed");
    }
  }

  const logTextGen = (level: number, service: string, message: string) => 
    `service: ${service} timestamp: ${new Date().toString()} - ${logLeveltoLogText(level)} ${message}`;

  try{
    console.log(logTextGen(level, service, message));
  } catch (e ) {
    const error = e as Error
    console.log(logTextGen(0, `logger logging ${service}`, error.message ));
  }
}