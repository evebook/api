import { Component, Inject } from '@nestjs/common';
import { CharacterService } from '../character/character.service';
import { Character } from '../character/character.entity';
import { CHARACTER_REPOSITORY_TOKEN } from '../character/character.constants';
import { Repository } from 'typeorm';
import Log from '../../utils/Log';
import { CorporationService } from '../corporation/corporation.service';
import { CORPORATION_REPOSITORY_TOKEN } from '../corporation/corporation.constants';
import { Corporation } from '../corporation/corporation.entity';

@Component()
export class UpdaterService {

  private readonly LOOP_INTERVAL = 60000; // 1min timeout
  private readonly UPDATE_INTERVAL = '1 hour';
  private readonly UPDATE_LIMIT = 100;

  constructor(
    @Inject(CHARACTER_REPOSITORY_TOKEN) private characterRepository: Repository<Character>,
    @Inject(CORPORATION_REPOSITORY_TOKEN) private corporationRepository: Repository<Corporation>,
    private characterService: CharacterService,
    private corporationService: CorporationService,
  ) {
    this.loop();
    setInterval(this.loop.bind(this), this.LOOP_INTERVAL);
  }

  /**
   * Main Loop
   */
  private loop(): void {
    Promise.all([
      this.updateCharacters(),
      this.updateCorporations(),
    ])
    .then(() => {
      Log.info('Update loop done');
    });
  }

  /**
   * Update Characters
   * @return {Promise<void>}
   */
  private async updateCharacters(): Promise<void> {
    const idsStream = await this.characterRepository
    .createQueryBuilder('character')
    .select('id')
    .where(`"updatedAt" < (NOW() - interval '${this.UPDATE_INTERVAL}')`)
    .limit(this.UPDATE_LIMIT)
    .stream();

    idsStream.on('error', (err) => {
      throw err;
    });

    idsStream.on('data', ({ id }) => {
      this.characterService.get(id)
      .then(character => this.characterService.update(character));
    });
  }

  /**
   * Update Corporations
   * @return {Promise<void>}
   */
  private async updateCorporations(): Promise<void> {
    const idsStream = await this.corporationRepository
    .createQueryBuilder('corporation')
    .select('id')
    .where(`"updatedAt" < (NOW() - interval '${this.UPDATE_INTERVAL}')`)
    .limit(this.UPDATE_LIMIT)
    .stream();

    idsStream.on('error', (err) => {
      throw err;
    });

    idsStream.on('data', ({ id }) => {
      this.corporationService.get(id)
      .then(corporation => this.corporationService.update(corporation));
    });
  }

}
