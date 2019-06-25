import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { CharacterModule } from '../character/character.module';
import { CorporationModule } from '../corporation/corporation.module';
import { AllianceModule } from '../alliance/alliance.module';
import { HashtagModule } from '../hashtag/hashtag.module';
import { UniverseLocationModule } from '../universe/location/location.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from './post.repository';
import { CommandBus, EventBus, CqrsModule } from '@nestjs/cqrs';
import { commandHandlers } from './commands/handlers';
import { eventHandlers } from './events/handlers';
import { ModuleRef } from '@nestjs/core';
import { NotificationModule } from '../notification/notification.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { MetascraperModule } from '../metascraper/metascraper.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([PostRepository]),

    UniverseLocationModule,
    HashtagModule,
    NotificationModule,
    WebsocketModule,

    forwardRef(() => MetascraperModule),
    forwardRef(() => AuthenticationModule),
    forwardRef(() => CharacterModule),
    forwardRef(() => CorporationModule),
    forwardRef(() => AllianceModule),
  ],
  controllers: [
    PostController,
  ],
  providers: [
    PostService,
    ...commandHandlers,
    ...eventHandlers,
  ],
  exports: [
    PostService,
  ],
})
export class PostModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly command$: CommandBus,
    private readonly event$: EventBus,
  ) {
  }

  onModuleInit() {
    // this.command$.setModuleRef(this.moduleRef);
    // this.event$.setModuleRef(this.moduleRef);

    // // subject$ is protected and doesn't work :(
    // // this.googlePubSub.bridgeEventsTo(this.event$.subject$);
    // // this.event$.publisher = this.googlePubSub;

    // this.event$.register(eventHandlers);
    // this.command$.register(commandHandlers);
  }
}
