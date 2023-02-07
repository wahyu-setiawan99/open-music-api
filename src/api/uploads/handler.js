const config = require('../../services/utils/config');

class UploadsHandler {
  constructor(storageService, musicsService, validator) {
    this._storageService = storageService;
    this._musicsService = musicsService;
    this._validator = validator;
  }

  async postUploadCoverAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;

    await this._musicsService.addCoverAlbumById(id, fileLocation);

    const response = h.response({
      status: 'success',
      message: `image has been uploaded successfully to ${id}`,
      data: {
        fileLocation,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
