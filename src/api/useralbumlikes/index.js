const UserAlbumLikes = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async (server, { likesService, musicsService, cacheService }) => {
    const userAlbumLikes = new UserAlbumLikes(likesService, musicsService, cacheService);

    server.route(routes(userAlbumLikes));
  },
};
