const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBtoModel } = require('../utils');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'insert into playlists values($1, $2, $3) returning id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist failed to add');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'select playlists.id, playlists.name, users.username from playlists left join collaborations on playlists.id = collaborations.playlist_id join users on users.id = playlists.owner where playlists.owner = $1 or collaborations.user_id = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapDBtoModel);
  }

  async getPlaylistById(id) {
    const query = {
      text: 'select playlists.id, playlists.name, users.username from playlists inner join users on users.id=playlists.owner where playlists.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Cannot find playlist id');
    }

    return result.rows.map(mapDBtoModel)[0];
  }

  async deletePlaylist(id) {
    const query = {
      text: 'delete from playlists where id = $1 returning id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Cannot delete playlist. Id not found');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaboration(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'select * from playlists where id=$1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Cannot find playlist');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('You are not authorized to access this playlist');
    }
  }
}

module.exports = PlaylistsService;
