const InvariantError = require('../../exceptions/InvariantError');
const { MusicsPayloadSchema, SongPayloadSchema } = require('./schema');

const MusicsValidator = {
  validateAlbumPayload: (payload) => {
    const validationAlbumResult = MusicsPayloadSchema.validate(payload);
    if (validationAlbumResult.error) {
      throw new InvariantError(validationAlbumResult.error.message);
    }
  },
  validateSongPayload: (payload) => {
    const validationSongResult = SongPayloadSchema.validate(payload);
    if (validationSongResult.error) {
      throw new InvariantError(validationSongResult.error.message);
    }
  },
};

module.exports = MusicsValidator;
