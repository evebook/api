import { Controller } from '@nestjs/common';
import { IMetascraperGrpcService, IProcessUrlRequest } from './metascraper.grpc.interface';
import { IURLMetadata } from '../metascraper.interface';
import { Observable } from 'rxjs/internal/Observable';
import { MetascraperService } from '../metascraper.service';
import { from } from 'rxjs';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class MetascraperGrpcController implements IMetascraperGrpcService {

  constructor(
    private readonly metascraperService: MetascraperService
  ){}

  @GrpcMethod('MetascraperService')
  processUrl(data: IProcessUrlRequest): Observable<IURLMetadata> {
    return from(this.metascraperService.processUrl(data.url));
  }
}
