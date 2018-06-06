import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AllianceService } from '../alliance/alliance.service';
import { LoggerService } from '../core/logger/logger.service';

@Injectable()
export class CorporationAllianceExecutorGuard implements CanActivate {
  constructor(
    private allianceService: AllianceService,
    private loggerService: LoggerService,
  ) {
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const character = request.character;

    // TODO: Handle "not in alliance" exception! #74

    const executorCorporation = await this.allianceService.getExecutorCorporation(
      character.corporation.alliance.id);

    this.loggerService.debug(
      '[CorporationAllianceExecutorGuard]',
      character.alliance,
      executorCorporation);

    return character && executorCorporation && character.corporation.id === executorCorporation.id;
  }
}
