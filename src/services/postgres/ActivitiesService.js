const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBtoModel } = require('../utils');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: 'insert into playlist_song_activities values($1, $2, $3, $4, $5, $6) returning id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Activity playlist cannot be recorded');
    }
  }

  async getActivities(playlistId) {
    const query = {
      text: 'select playlist_song_activities.action, playlist_song_activities.time, users.username, songs.title from playlist_song_activities join users on playlist_song_activities.user_id = users.id join songs on playlist_song_activities.song_id = songs.id where playlist_song_activities.playlist_id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Record of playlist cannot be found');
    }

    return result.rows.map(mapDBtoModel);
  }
}

module.exports = ActivitiesService;
