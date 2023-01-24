const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBtoModel } = require('../utils');

class MusicsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'insert into albums values($1, $2, $3) returning id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album failed to add');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'select * from albums where id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album cannot be found');
    }

    return result.rows.map(mapDBtoModel)[0];
  }

  async getSongsbyAlbumId(id) {
    const query = {
      text: 'select * from songs where album_id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return null;
    }

    return result.rows.map(mapDBtoModel);
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'update albums set name = $1, year=$2 where id=$3 returning id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album, id cannot be found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'delete from albums where id = $1 returning id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album failed to delete. No id found');
    }
  }

  /*
  songs services
  */

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'insert into songs values($1, $2, $3, $4, $5, $6, $7) returning id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to add');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('select * from songs');

    return result.rows.map(mapDBtoModel);
  }

  async getSongsByTitleandPerf(title, performer) {
    const result = await this._pool.query(`select * from songs where lower(title) like '%${title}%' and lower(performer) like '%${performer}%'`);

    return result.rows.map(mapDBtoModel);
  }

  async getSongsByTitle(title) {
    const result = await this._pool.query(`select * from songs where lower(title) like '%${title.toLowerCase()}%'`);

    return result.rows.map(mapDBtoModel);
  }

  async getSongsByPerformer(performer) {
    const result = await this._pool.query(`select * from songs where lower (performer) like '%${performer.toLowerCase()}%'`);

    return result.rows.map(mapDBtoModel);
  }

  async getSongById(id) {
    const query = {
      text: 'select * from songs where id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song cannot be found');
    }

    return result.rows.map(mapDBtoModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: 'update songs set title = $1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6 where id=$7 returning id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update song, id cannot be found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'delete from songs where id = $1 returning id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song failed to delete. No id found');
    }
  }
}

module.exports = MusicsService;
