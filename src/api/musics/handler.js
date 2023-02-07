class MusicsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  /*
  handlers for albums
  */

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'unnamed', year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album is successfully added',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsbyAlbumId(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs: songs ? songs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })) : [],
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album has been successfully update',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album has been deleted',
    };
  }

  /*
  handlers for songs
  */

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title = 'untitled', year, genre, performer, duration, albumId,
    } = request.payload;

    const songId = await this._service.addSong({
      title, year, genre, performer, duration, albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'Song is successfully added',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    if (title && performer) {
      const SongsByTitleandPerf = await this._service.getSongsByTitleandPerf(title, performer);
      return {
        status: 'success',
        data: {
          songs: SongsByTitleandPerf.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      };
    }

    if (title) {
      const songsByTitle = await this._service.getSongsByTitle(title);
      return {
        status: 'success',
        data: {
          songs: songsByTitle.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      };
    }

    if (performer) {
      const songsByPerformer = await this._service.getSongsByPerformer(performer);
      return {
        status: 'success',
        data: {
          songs: songsByPerformer.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      };
    }

    const songs = await this._service.getSongs();
    return {
      status: 'success',
      data: {
        songs: songs.map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        })),
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Song has been successfully update',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song has been deleted',
    };
  }
}

module.exports = MusicsHandler;
