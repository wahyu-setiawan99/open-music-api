const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { storageService, musicsService, validator }) => {
    const uploadsHandler = new UploadsHandler(storageService, musicsService, validator);

    server.route(routes(uploadsHandler));
  },
};
