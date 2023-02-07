const routes = require('./routes');
const ActivitesHandler = require('./handler');

module.exports = {
  name: 'activities',
  version: '1.0.0',
  register: async (server, { activitiesService, playlistsService }) => {
    const activitiesHandler = new ActivitesHandler(activitiesService, playlistsService);

    server.route(routes(activitiesHandler));
  },
};
