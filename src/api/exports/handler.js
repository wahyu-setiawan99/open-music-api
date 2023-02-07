class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportPlaylistByIdHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    const { targetEmail } = request.payload;
    const { playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this._producerService.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Your playlist is in queue',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
