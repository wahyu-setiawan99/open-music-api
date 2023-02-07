const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addUserAlbumLikes(userId, albumId) {
    const id = `albumLikes-${nanoid(16)}`;
    const query = {
      text: 'insert into user_album_likes values ($1, $2, $3) returning id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Album cannot be liked');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async verifyUserAlbumLike(userId, albumId) {
    const query = {
      text: 'select * from user_album_likes where user_id = $1 and album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length > 0) {
      await this.deleteUserAlbumLikes(userId, albumId);
      return 'You\'ve unliked the album';
    }
    await this.addUserAlbumLikes(userId, albumId);
    return 'you\'ve liked the album';
  }

  async deleteUserAlbumLikes(userId, albumId) {
    const query = {
      text: 'delete from user_album_likes where user_id = $1 and album_id = $2 returning id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Album cannot be unliked');
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    const query = {
      text: 'select * from user_album_likes where album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Cannot find album');
    }

    await this._cacheService.set(`albumLikes:${albumId}`, JSON.stringify(result.rowCount));
    // console.log('set cache');
    return result.rowCount;
  }
}

module.exports = UserAlbumLikesService;
