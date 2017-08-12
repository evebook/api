import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as cors from 'cors';
import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';
import { ValidatorPipe } from './pipes/validator.pipe';

// Used for TypeORM
import 'reflect-metadata';

// Import config
import { config } from 'dotenv';
config();

const instance = express();
instance.use(bodyParser.json());
instance.use(cors());

NestFactory.create(ApplicationModule, instance)
.then(app => {
  app.useGlobalPipes(new ValidatorPipe());
  app.listen(parseInt(process.env.PORT), () =>
    console.log(`Application is listening on port ${process.env.PORT}.`));
});

