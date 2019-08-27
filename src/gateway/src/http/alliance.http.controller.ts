import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { AllianceService } from '../alliance.service';
import { DAlliance } from './alliance.dto';
import { ApiResponse, ApiUseTags } from '@nestjs/swagger';

@ApiUseTags('alliances')
@Controller('alliances')
export class AllianceHttpController {

  constructor(
    private readonly allianceService: AllianceService,
  ) {
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: DAlliance,
    description: 'Get Alliance by id',
  })
  @Get('/:allianceId')
  public async search(
    @Param('allianceId') allianceId: number,
  ): Promise<DAlliance> {
    const alliance = await this.allianceService.get(allianceId);
    return new DAlliance(alliance);
  }

}