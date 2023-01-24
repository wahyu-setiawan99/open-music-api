// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const MusicsService = require('./services/postgres/MusicsService');
const openMusicAPI = require('./api/musics');
const MusicsValidator = require('./validator/musics');

const init = async () => {
  const musicsService = new MusicsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: openMusicAPI,
    options: {
      service: musicsService,
      validator: MusicsValidator,
    },
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
