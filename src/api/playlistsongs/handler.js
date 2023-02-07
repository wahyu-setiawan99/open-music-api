class PlaylistSongsHandler {
  constructor(playlistsongsService, playlistsService, musicsService, activitiesService, validator) {
    this._playlistsongsService = playlistsongsService;
    this._playlistsService = playlistsService;
    this._musicsService = musicsService;
    this._activitiesService = activitiesService;
    this._validator = validator;
  }

  async postPlaylistSongsHandler(request, h) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    // verify if songId exists in database songs
    await this._musicsService.getSongById(songId);

    // verify the playlist access
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    // add songs to playlist
    const PlaylistSongId = await this._playlistsongsService.addPlaylistSong(id, songId);

    // record the activites add
    await this._activitiesService.addActivity(id, songId, credentialId, 'add');

    const response = h.response({
      status: 'success',
      message: 'song has been added to playlist',
      data: {
        PlaylistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const playlist = await this._playlistsService.getPlaylistById(id);
    const playlistSongs = await this._playlistsongsService.getPlaylistSong(id);

    return {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          songs: playlistSongs ? playlistSongs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })) : [],
        },
      },
    };
  }

  async deletePlaylistSongsHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    // verify if songId exists in database songs
    await this._musicsService.getSongById(songId);

    // verify the access
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    // delete songs from playlist
    await this._playlistsongsService.deletePlaylistSong(id, songId);

    // record the activites delete
    await this._activitiesService.addActivity(id, songId, credentialId, 'delete');

    return {
      status: 'success',
      message: 'song has been deleted from playlist',
    };
  }
}

module.exports = PlaylistSongsHandler;
