import {log as logBase} from "../../../lib/log.ts"
import dotenv from "npm:dotenv";
import process from "node:process";

dotenv.config();

const logLevel: number = Number(process.env.LOG_LEVEL) ?? 6;

const serviceName = "data acquisition";

export const log = (level: number, message: string) => 
  logBase(level, logLevel, serviceName, message );