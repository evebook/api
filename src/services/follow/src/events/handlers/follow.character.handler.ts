import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { FollowEvent, FollowCharacterEvent } from '../follow.event';
import * as uuidv4 from 'uuid/v4';

@EventsHandler(FollowCharacterEvent)
export class FollowCharacterEventHandler implements IEventHandler<FollowCharacterEvent> {

  constructor(
    private readonly commandBus: CommandBus,
  ) {
  }

  async handle(event: FollowEvent) {
    const eventUuid = uuidv4();

    // TODO: Implement this?
    // const notification = new Notification();
    // notification.type = NOTIFICATION_TYPE.NEW_FOLLOWER;
    // notification.recipient = event.follow.followingCharacter;
    // notification.senderCharacter = event.follow.follower;
    // notification.eventUuid = eventUuid;

    // How should this be handeled, direct grpc call?
    // this.commandBus.execute(new CreateNotificationCommand(notification));
  }
}
