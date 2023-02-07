const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBtoModel } = require('../utils');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlistSong-${nanoid(16)}`;
    const query = {
      text: 'insert into playlistsongs values($1, $2, $3) returning id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Fail to add song to playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylistSong(playlistId) {
    const query = {
      text: 'select songs.* from playlists join playlistsongs on playlists.id = playlistsongs.playlist_id join songs on songs.id = playlistsongs.song_id where playlists.id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Cannot find the playlist id');
    }

    return result.rows.map(mapDBtoModel);
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'delete from playlistsongs where playlist_id = $1 and song_id = $2 returning id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Fail to delete song from playlist. Song id not found');
    }
  }
}

module.exports = PlaylistSongsService;
