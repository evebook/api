import { MiddlewaresConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { SSOModule } from '../external/sso/sso.module';
import { CharacterModule } from '../character/character.module';
import { AuthMiddleware } from './authentication.middleware';

@Module({
  modules: [
    SSOModule,
    CharacterModule,
  ],
  controllers: [
    AuthenticationController,
  ],
  components: [
    AuthenticationService,
  ],
})
export class AuthenticationModule {
  configure(consumer: MiddlewaresConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'authentication/sso/verify', method: RequestMethod.GET,
    });
  }
}
