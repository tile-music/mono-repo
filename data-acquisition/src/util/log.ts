import { log as logBase } from "../../../lib/log.ts"
import { dotenv, process } from "../../deps.ts"

dotenv.config();

const logLevel: number = Number(process.env.LOG_LEVEL) ?? 6;

const serviceName = "data acquisition";

export const log = (level: number, message: string) => 
  logBase(level, logLevel, serviceName, message );