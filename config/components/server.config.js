'use strict';

const joi = require('joi');

/**
 * Generate a validation schema using joi to check the type of your environment variables
 */
const envSchema = joi
  .object({
    NODE_ENV: joi.string().allow(['development', 'production', 'test']),
    PORT: joi.number(),
    API_VERSION: joi.number(),
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
  env: envVars.NODE_ENV,
  isTest: envVars.NODE_ENV === 'test',
  isDevelopment: envVars.NODE_ENV === 'development',
  tag_public: 'PUBLIC',
  tag_private: 'PRIVATE',
  KeySecure: 'authorization',
  JWT_SECRET: '30421687313841dzxcSSwWWXXa',
  SessionTime: 120,
  SENDGRID_API_KEY: envVars.SENDGRID_API_KEY,
  server: {
    port: envVars.PORT || 3000,
    apiVersion: envVars.API_VERSION || 'v1',
  },
  JugadorPasswordDefalult: '123456',
};

module.exports = config;
