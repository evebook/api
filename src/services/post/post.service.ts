import { Injectable } from '@nestjs/common';
import { Post } from '@new-eden-social/services-post/post.entity';
import { POST_TYPES } from '@new-eden-social/services-post/post.constants';
import { PostRepository } from '@new-eden-social/services-post/post.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { MetascraperGrpcClient } from '@new-eden-social/services-metascraper';
import { IKillmail } from '@new-eden-social/zkillboard';
import { HashtagGrpcClient } from '@new-eden-social/services-hashtag';
import { NotificationGrpcClient } from '@new-eden-social/services-notification';
import * as uuidv4 from 'uuid/v4';
import { ICreatePost } from '@new-eden-social/services-post/post.interface';
import { NOTIFICATION_TYPE } from '@new-eden-social/services-notification/notification.constants';

@Injectable()
export class PostService {

  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
    private readonly metascraperClient: MetascraperGrpcClient,
    private readonly hashtagClient: HashtagGrpcClient,
    private readonly notificationClient: NotificationGrpcClient,
  ) {
  }

  /**
   * Get single Post
   * @param id
   * @return {Promise<Post>}
   */
  public async get(id: string): Promise<Post> {
    return this.postRepository.findOne(id);
  }

  /**
   * Create Post as character
   * @param {VCreatePost} postData
   * @param {Number} characterId
   * @return {Promise<Post>}
   */
  public async createAsCharacter(
    postData: ICreatePost,
    characterId: number,
  ): Promise<Post> {
    const post = new Post();
    post.content = postData.content;
    post.type = postData.type;
    post.characterId = characterId;
    const createdPost = await this.create(post, postData);

    const eventUuid = uuidv4();
    await this.notificationClient.service.create({
      eventUuid,
      senderCharacterId: createdPost.characterId,
      postId: createdPost.id,
      recipientId: characterId,
      type: NOTIFICATION_TYPE.NEW_POST_ON_YOUR_WALL,
    });

    return createdPost;
  }

  /**
   * Create Post as corporation
   * @param {VCreatePost} postData
   * @param {Number} corporationId
   * @return {Promise<Post>}
   */
  public async createAsCorporation(
    postData: ICreatePost,
    corporationId: number,
  ): Promise<Post> {
    const post = new Post();
    post.content = postData.content;
    post.type = postData.type;
    post.corporationId = corporationId;

    // TODO: Notification

    return this.create(post, postData);
  }

  /**
   * Create Post as alliance
   * @param {VCreatePost} postData
   * @param {Number} allianceId
   * @return {Promise<Post>}
   */
  public async createAsAlliance(
    postData: ICreatePost,
    allianceId: number,
  ): Promise<Post> {
    const post = new Post();
    post.content = postData.content;
    post.type = postData.type;
    post.allianceId = allianceId;

    // TODO: Notification

    return this.create(post, postData);
  }

  /**
   * Get character wall
   * @param {Number} characterId
   * @param {Number} limit
   * @param {Number} page
   * @return {Promise<Post[]>}
   */
  public async getCharacterWall(
    characterId: number,
    limit = 10,
    page = 0,
  ): Promise<{ posts: Post[], count: number }> {
    const [posts, count] = await this.postRepository.getCharacterWall(characterId, limit, page);
    return { posts, count };
  }

  /**
   * Get corporation wall
   * @param {Number} corporationId
   * @param {Number} limit
   * @param {Number} page
   * @return {Promise<Post[]>}
   */
  public async getCorporationWall(
    corporationId: number,
    limit = 10,
    page = 0,
  ): Promise<{ posts: Post[], count: number }> {
    const [posts, count] = await this.postRepository.getCorporationWall(corporationId, limit, page);
    return { posts, count };
  }

  /**
   * Get alliance wall
   * @param {Number} allianceId
   * @param {Number} limit
   * @param {Number} page
   * @return {Promise<Post[]>}
   */
  public async getAllianceWall(
    allianceId: number,
    limit = 10,
    page = 0,
  ): Promise<{ posts: Post[], count: number }> {
    const [posts, count] = await this.postRepository.getAllianceWall(allianceId, limit, page);
    return { posts, count };
  }

  /**
   * Get all posts for specific hashtag
   * @param {string} hashtag
   * @param {number} limit
   * @param {number} page
   * @returns {Promise<{posts: Post[]; count: number}>}
   */
  public async getHashtagWall(
    hashtag: string,
    limit = 10,
    page = 0,
  ): Promise<{ posts: Post[], count: number }> {
    const [posts, count] = await this.postRepository.getByHashtag(hashtag, limit, page);
    return { posts, count };
  }

  /**
   * Get all posts for specific location
   * @param {number} locationId
   * @param {number} limit
   * @param {number} page
   * @returns {Promise<{posts: Post[]; count: number}>}
   */
  public async getLocationWall(
    locationId: number,
    limit = 10,
    page = 0,
  ): Promise<{ posts: Post[], count: number }> {
    const [posts, count] = await this.postRepository.getByLocation(locationId, limit, page);
    return { posts, count };
  }

  /**
   * Get latest posts
   * @param {Number} limit
   * @param {Number} page
   * @return {Promise<Post[]>}
   */
  public async getLatestWall(
    limit = 10,
    page = 0,
  ): Promise<{ posts: Post[], count: number }> {
    const [posts, count] = await this.postRepository.getLatest(limit, page);
    return { posts, count };
  }

  /**
   * Create killmail post
   * @param {Killmail} killmail
   * @param {Number} finalBlow
   * @return {Promise<Post>}
   */
  public async createKillmailPost(killmail: IKillmail, finalBlow: number): Promise<Post> {
    const post = new Post();
    post.type = POST_TYPES.KILLMAIL;
    post.killmailId = killmail.id;
    post.characterId = finalBlow;
    post.createdAt = killmail.date;
    post.locationId = killmail.locationId;
    return this.postRepository.save(post);
  }

  public async getNumOfPostsByCharacter(
    characterId: number,
  ): Promise<number> {
    return this.postRepository.getNumOfPostsByCharacter(characterId);
  }

  public async getNumOfPostsByCorporation(
    corporationId: number,
  ): Promise<number> {
    return this.postRepository.getNumOfPostsByCorporation(corporationId);
  }

  public async getNumOfPostsByAlliance(
    allianceId: number,
  ): Promise<number> {
    return this.postRepository.getNumOfPostsByAlliance(allianceId);
  }

  /**
   * Create post
   * @param {Post} post
   * @param {VCreatePost} postData
   * @returns {Promise<Post>}
   */
  private async create(post: Post, postData: ICreatePost): Promise<Post> {
    if (postData.allianceId) {
      post.allianceWallId = postData.allianceId;
    }

    if (postData.corporationId) {
      post.corporationWallId = postData.corporationId;
    }

    if (postData.characterId) {
      post.characterWallId = postData.characterId;
    }

    if (postData.locationId) {
      post.locationId = postData.locationId;
    }

    if (postData.url) {
      const urlMetadata = await this.metascraperClient.service.processUrl({ url: postData.url }).toPromise();
      post.url = urlMetadata;
      post.killmailId = urlMetadata.killmailId;
    }

    post.hashtags = await this.hashtagClient.service.parse(post.content).toPromise();

    return this.postRepository.save(post);
  }
}
