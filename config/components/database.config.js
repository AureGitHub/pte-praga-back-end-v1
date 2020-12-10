'use strict';

const joi = require('joi');

/**
 * Generate a validation schema using joi to check the type of your environment variables
 */
const envSchema = joi
  .object({
    DB_USER: joi.string(),
    DB_HOST: joi.string(),
    DB_PASSWORD: joi
      .string()
      .optional()
      .empty(''),
    DB_DATABASE: joi.string(),
    DB_PORT: joi.number(),
    DATABASE_URL: joi.string()
  })
  .unknown()
  .required();

/**
 * Validate the env variables using joi.validate()
 */
const { error, value: envVars } = joi.validate(process.env, envSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  databaseConfig: {
    user: envVars.DB_USER,
    host: envVars.DB_HOST,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_DATABASE,
    port: envVars.DB_PORT,
    DATABASE_URL : envVars.DATABASE_URL,
  },
};

module.exports = config;
