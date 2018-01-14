import { POST_TYPES } from './post.constants';
import { Post } from './post.entity';
import { DCharacterShort } from '../character/character.dto';
import { DLocation } from '../location/location.dto';
import { DKillmailShort } from '../killmail/killmail.dto';

export class DPost {
  id: string;
  content: string;
  type: POST_TYPES;
  character: DCharacterShort;
  killmail?: DKillmailShort;
  hashtags: string[];
  location?: DLocation;

  constructor(post: Post) {
    this.id = post.id;
    this.content = post.content;
    this.type = post.type;
    this.character = new DCharacterShort(post.character);
    this.hashtags = post.hashtags.map(h => h.name);
    if (post.location) this.location = new DLocation(post.location);
    if (post.killmail) this.killmail = new DKillmailShort(post.killmail);
  }
}

export class DPostList {
  posts: DPost[];

  constructor(posts: Post[]) {
    this.posts = posts.map(post => new DPost(post));
  }
}
