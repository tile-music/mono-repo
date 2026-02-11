import { log as logBase } from "_shared/log.ts";

const logLevel: number = Number(Deno.env.get("DATA_ACQ_LOG_LEVEL")) ?? 6;

const serviceName = "data acquisition";

export const log = (level: number, message: string) =>
    logBase(level, logLevel, serviceName, message);
