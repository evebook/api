import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DPost, DPostList } from './post.dto';
import { AuthenticatedCharacter } from '../authentication/authentication.decorators';
import { ApiBearerAuth, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Pagination, VPagination } from '@new-eden-social/pagination';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { PostGrpcClient } from '@new-eden-social/services-post';
import { VCreatePost } from './post.validate';
import { ICharacterResponse } from '@new-eden-social/services-character';
import { CorporationRolesGuard } from '../corporation/corporation.roles.guard';
import { CorporationAllianceExecutorGuard } from '../corporation/corporation.allianceExecutor.guard';
import { CorporationGrpcClient, CORPORATION_ROLES } from '@new-eden-social/services-corporation';
import { CorporationRoles } from '../corporation/corporation.roles.decorator';

@ApiUseTags('posts')
@Controller('posts')
export class PostController {

  constructor(
    private readonly postClient: PostGrpcClient,
    private readonly corporationClient: CorporationGrpcClient,
  ) {
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: DPostList,
    description: 'Get latest posts',
  })
  @Get('latest')
  public async getLatestPosts(
    @Pagination() pagination: VPagination,
  ) {
    const { posts, count } = await this.postClient.service.getLatestWall({
      pagination: {
        limit: pagination.limit,
        page: pagination.page,
      }
    }).toPromise();

    return new DPostList(posts, pagination.page, pagination.limit, count);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: DPostList,
    description: 'Get Character Wall',
  })
  @Get('/character/:characterId')
  public async getCharacterWall(
    @Param('characterId') characterId: number,
    @Pagination() pagination: VPagination,
  ): Promise<DPostList> {
    const { posts, count } = await this.postClient.service.getCharacterWall({
      characterId,
      pagination: {
        limit: pagination.limit,
        page: pagination.page,
      }
    }).toPromise();

    return new DPostList(posts, pagination.page, pagination.limit, count);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: DPostList,
    description: 'Get Corporation Wall',
  })
  @Get('/corporation/:corporationId')
  public async getCorporationWall(
    @Param('corporationId') corporationId: number,
    @Pagination() pagination: VPagination,
  ): Promise<DPostList> {
    const { posts, count } = await this.postClient.service.getCorporationWall({
      corporationId,
      pagination: {
        limit: pagination.limit,
        page: pagination.page,
      }
    }).toPromise();

    return new DPostList(posts, pagination.page, pagination.limit, count);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: DPostList,
    description: 'Get Alliance Wall',
  })
  @Get('/alliance/:allianceId')
  public async getAllianceWall(
    @Param('allianceId') allianceId: number,
    @Pagination() pagination: VPagination,
  ): Promise<DPostList> {
    const { posts, count } = await this.postClient.service.getAllianceWall({
      allianceId,
      pagination: {
        limit: pagination.limit,
        page: pagination.page,
      }
    }).toPromise();

    return new DPostList(posts, pagination.page, pagination.limit, count);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: DPostList,
    description: 'Get posts for Hashtag',
  })
  @Get('/hashtag/:hashtag')
  public async getByHashtag(
    @Param('hashtag') hashtag: string,
    @Pagination() pagination: VPagination,
  ): Promise<DPostList> {
    const { posts, count } = await this.postClient.service.getHashtagWall({
      hashtag,
      pagination: {
        limit: pagination.limit,
        page: pagination.page,
      }
    }).toPromise();
    return new DPostList(posts, pagination.page, pagination.limit, count);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: DPostList,
    description: 'Get posts for Location',
  })
  @Get('/location/:locationId')
  public async getByLocation(
    @Param('locationId') locationId: number,
    @Pagination() pagination: VPagination,
  ): Promise<DPostList> {
    const { posts, count } = await this.postClient.service.getLocationWall({
      locationId,
      pagination: {
        limit: pagination.limit,
        page: pagination.page,
      }
    }).toPromise();
    return new DPostList(posts, pagination.page, pagination.limit, count);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: DPost,
    description: 'Get specific post by id',
  })
  @Get('/:id')
  public async get(
    @Param('id') postId: string,
  ): Promise<DPost> {
    const post = await this.postClient.service.get({ postId }).toPromise();
    return new DPost(post);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DPost,
    description: 'Post as Character',
  })
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @Post('/character')
  public async createAsCharacter(
    @Body() postData: VCreatePost,
    @AuthenticatedCharacter() character: ICharacterResponse,
  ): Promise<any> {
    const post = await this.postClient.service.createAsCharacter({
      post: postData,
      characterId: character.id,
    }).toPromise();
    return new DPost(post);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DPost,
    description: 'Post as Corporation',
  })
  @ApiBearerAuth()
  @Post('/corporation')
  @UseGuards(CorporationRolesGuard)
  @CorporationRoles(
    CORPORATION_ROLES.DIRECTOR,
    CORPORATION_ROLES.DIPLOMAT,
    CORPORATION_ROLES.COMMUNICATION_OFFICER)
  public async createAsCorporation(
    @Body() postData: VCreatePost,
    @AuthenticatedCharacter() character: ICharacterResponse,
  ): Promise<DPost> {
    const post = await this.postClient.service.createAsCorporation({
      post: postData,
      corporationId: character.corporationId,
    }).toPromise();
    return new DPost(post);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DPost,
    description: 'Post as Alliance',
  })
  @ApiBearerAuth()
  @Post('/alliance')
  @UseGuards(CorporationRolesGuard, CorporationAllianceExecutorGuard)
  @CorporationRoles(
    CORPORATION_ROLES.DIRECTOR,
    CORPORATION_ROLES.DIPLOMAT,
    CORPORATION_ROLES.COMMUNICATION_OFFICER)
  public async createAsAlliance(
    @Body() postData: VCreatePost,
    @AuthenticatedCharacter() character: ICharacterResponse,
  ): Promise<DPost> {
    const corporation = await this.corporationClient.service.get({
      corporationId: character.corporationId,
    }).toPromise();

    const post = await this.postClient.service.createAsAlliance({
      post: postData,
      allianceId: corporation.allianceId,
    }).toPromise();
    return new DPost(post);
  }

}
