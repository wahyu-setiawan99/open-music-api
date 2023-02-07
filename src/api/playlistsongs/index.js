const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {
    playlistsongsService,
    playlistsService,
    musicsService,
    activitiesService,
    validator,
  }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      playlistsongsService,
      playlistsService,
      musicsService,
      activitiesService,
      validator,
    );

    server.route(routes(playlistSongsHandler));
  },
};
