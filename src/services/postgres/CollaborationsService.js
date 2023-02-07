const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaborations(playlistId, userId) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'insert into collaborations values($1, $2, $3) returning id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Cannot add collaborations');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'delete from collaborations where playlist_id = $1 and user_id = $2 returning id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Cannot delete collaborations');
    }
  }

  async verifyCollaboration(playlistId, userId) {
    const query = {
      text: 'select * from collaborations where playlist_id = $1 and user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('User in collaboration cannot be verified');
    }
  }
}

module.exports = CollaborationsService;
