import 'dotenv/config';
import * as joi from 'joi';
interface EnVars {
  PORT: number;
  NATS_SERVERS: string[];
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const enVars: EnVars = value;

export const envs = {
  port: enVars.PORT,
  natsServers: enVars.NATS_SERVERS,
};
