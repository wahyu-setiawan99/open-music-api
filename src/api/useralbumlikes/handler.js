class UserAlbumLikes {
  constructor(likesService, musicsService, cacheService) {
    this._likesService = likesService;
    this._musicsService = musicsService;
    this._cacheService = cacheService;
  }

  async postUserAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._musicsService.getAlbumById(id);

    const likeAlbum = await this._likesService.verifyUserAlbumLike(credentialId, id);

    const response = h.response({
      status: 'success',
      message: likeAlbum,
    });
    response.code(201);
    return response;
  }

  async getUserAlbumLikesHandler(request, h) {
    const { id } = request.params;

    try {
      const result = await this._cacheService.get(`albumLikes:${id}`);
      const likes = JSON.parse(result);
      // console.log('result from cache');

      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      }).header('X-data-source', 'cache');
      response.code(200);
      return response;
    } catch (error) {
      const likes = await this._likesService.getAlbumLikes(id);
      // console.log('result from database');

      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.code(200);
      return response;
    }
  }
}

module.exports = UserAlbumLikes;
