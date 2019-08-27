import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ICharacterGrpcService, ICharacterEntity } from './character.grpc.interface';
import { CharacterService } from '../character.service';
import { Character } from '../character.entity';

@Controller()
export class CharacterGrpcController implements ICharacterGrpcService {

  constructor(
    private readonly characterService: CharacterService,
    ) {
  }

  @GrpcMethod('CharacterService')
  exists(id: number): Observable<{ exists: boolean; }> {
    return from(this.characterService.exists(id)).pipe<{ exists: boolean }>(
      map<boolean, {exists: boolean}>(exists => ({ exists })),
    );
  }

  @GrpcMethod('CharacterService')
  get(id: number): Observable<ICharacterEntity> {
    return from(this.characterService.get(id)).pipe<ICharacterEntity>(
      map<Character, ICharacterEntity>(this.characterTransform)
    );
  }

  @GrpcMethod('CharacterService')
  getNotUpdated(interval: string, limit: number): Observable<ICharacterEntity[]> {
    return from(this.characterService.getNotUpdated(interval, limit)).pipe<ICharacterEntity[]>(
      map<Character[], ICharacterEntity[]>(characters => characters.map(this.characterTransform))
    );
  }

  @GrpcMethod('CharacterService')
  refresh(id: number): Observable<ICharacterEntity> {
    return from(this.characterService.get(id)).pipe<ICharacterEntity>(
      map<Character, ICharacterEntity>(this.characterTransform)
    );
  }

  private characterTransform(character: Character): ICharacterEntity {
    return {
      id: character.id,
      handle: character.handle,
      name: character.name,
    };
  }
}