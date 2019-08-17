import { Alliance } from './alliance.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ESIService, ESIEntetyNotFoundException } from '@new-eden-social/esi';
import { LoggerService } from '@new-eden-social/logger';
import { UtilsService } from '@new-eden-social/utils';
import { AllianceRepository } from './alliance.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AllianceService {

  constructor(
    private readonly loggerService: LoggerService,
    private readonly utilsService: UtilsService,
    private readonly esiService: ESIService,
    @InjectRepository(AllianceRepository)
    private readonly allianceRepository: AllianceRepository,
  ) {
  }

  /**
   * Check if alliance exists
   * @param {number} id
   * @returns {Promise<Boolean>}
   */
  public async exists(id: number): Promise<Boolean> {
    try {
      await this.esiService.getAlliance(id);
    } catch (err) {
      if (err instanceof ESIEntetyNotFoundException) { return false; }
      throw err;
    }
    return true;
  }

  /**
   * Get Alliance by id
   * @param {number} id
   * @returns {Promise<Alliance>}
   */
  public async get(id: number): Promise<Alliance> {
    return this.findAllianceById(id);
  }

  /**
   * Get all alliances by ids
   * @param {number[]} ids
   * @returns {Promise<Alliance[]>}
   */
  public async getAllById(ids: number[]): Promise<Alliance[]> {
    const alliances = await this.allianceRepository.getAllByIds(ids);

    for (const id of ids) {
      const alliance = alliances.find(a => a.id === id);
      // If we didn't found in database, try to populate it
      if (!alliance) { alliances.push(await this.findAllianceById(id)); }
    }

    return alliances;
  }

  /**
   * Update corporation by id
   * @param {Alliance} alliance
   * @return {Promise<Corporation>}
   */
  public async update(alliance: Alliance): Promise<Alliance> {
    const esiAlliance = await this.esiService.getAlliance(alliance.id);

    alliance.populateESI(esiAlliance);

    return this.allianceRepository.save(alliance);
  }

  /**
   * Find alliance by id
   * @param {number} id
   * @returns {Promise<Alliance>}
   */
  private async findAllianceById(id: number) {
    this.loggerService.debug(`get alliance ${id}`);
    const foundAlliance = await this.allianceRepository.findOne(id);

    if (foundAlliance) { return foundAlliance; }

    // If alliance not in DB, load it from ESI
    const alliance = new Alliance();
    alliance.id = id;

    const esiAlliance = await this.esiService.getAlliance(id);
    alliance.populateESI(esiAlliance);

    // Create handle
    alliance.handle = this.utilsService.createHandle(alliance.id, alliance.name);

    return this.allianceRepository.save(alliance);
  }
}