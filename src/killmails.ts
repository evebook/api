import { NestFactory } from '@nestjs/core';
// Used for TypeORM
import 'reflect-metadata';
import Log from './utils/Log';
import { KillmailModule } from './modules/killmail/killmail.module';
// Import config
import { config } from 'dotenv';
// Request context
import 'zone.js';
import 'zone.js/dist/zone-node.js';
import 'zone.js/dist/long-stack-trace-zone.js';

config();
Log.init();

NestFactory.createMicroservice(KillmailModule, { port: parseInt(process.env.KILLMAILS_PORT, 10) })
.then(() => Log.info(`Killmail started on port ${process.env.KILLMAILS_PORT}`))
.catch(err => Log.error(err));
