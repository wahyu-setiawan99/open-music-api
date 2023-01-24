const MusicsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'openMusicAPI',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const musicHandler = new MusicsHandler(service, validator);
    server.route(routes(musicHandler));
  },
};
