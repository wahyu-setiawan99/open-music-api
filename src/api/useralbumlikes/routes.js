const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.postUserAlbumLikesHandler(request, h),
    options: {
      auth: 'openMusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.getUserAlbumLikesHandler(request, h),
  },
];

module.exports = routes;
