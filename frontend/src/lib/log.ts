import { log as shared_log } from "../../../lib/log";
import { LOG_LEVEL } from "$env/static/private"

/**
 * Logs a message with a specified log level.
 * Acts as a wrapper for the shared logger, with the
 * log level and service name populated by default.
 * 
 * @param level - The log level of the message to be logged.
 * Levels correspond directly to the log levels defined
 * in the shared logger.
 * @param message - The log message to be recorded.
 */
export function log(
    level: number,
    message: string
): void {
    const log_level = Number.parseInt(LOG_LEVEL);
    if (isNaN(log_level)) {
        console.error("!ALERT!: service: frontend - LOG_LEVEL is not a number");
        return;
    }

    shared_log(level, log_level, "frontend", message);
}