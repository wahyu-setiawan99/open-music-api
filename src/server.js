// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');
const ClientError = require('./exceptions/ClientError');
const config = require('./services/utils/config');

// musics
const musics = require('./api/musics');
const MusicsService = require('./services/postgres/MusicsService');
const MusicsValidator = require('./validator/musics');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsValidator = require('./validator/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');

// playlists
const playlists = require('./api/playlists');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');

// playlistSongs
const playlistSongs = require('./api/playlistsongs');
const PlaylistSongsValidator = require('./validator/playlistsongs');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');

// activites
const activities = require('./api/activities');
const ActivitiesService = require('./services/postgres/ActivitiesService');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsValidator = require('./validator/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');

// exports
const _exports = require('./api/exports');
const ExportsValidator = require('./validator/exports');
const producerService = require('./services/rabbitmq/ProducerService');

// uploads
const uploads = require('./api/uploads');
const UploadsValidator = require('./validator/uploads');
const StorageService = require('./services/storage/StorageService');

// uploads
const likes = require('./api/useralbumlikes');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const musicsService = new MusicsService(cacheService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsongsService = new PlaylistSongsService();
  const activitiesService = new ActivitiesService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const userAlbumLikes = new UserAlbumLikesService(cacheService);

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  // register external plugin
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // define JWT strategy
  server.auth.strategy('openMusic_jwt', 'jwt', {
    keys: config.postgre.accessToken,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.postgre.tokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: musics,
      options: {
        service: musicsService,
        validator: MusicsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistSongs,
      options: {
        playlistsongsService,
        playlistsService,
        musicsService,
        activitiesService,
        validator: PlaylistSongsValidator,
      },
    },
    {
      plugin: activities,
      options: {
        activitiesService,
        playlistsService,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        producerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService,
        musicsService,
        validator: UploadsValidator,
      },
    },
    {
      plugin: likes,
      options: {
        likesService: userAlbumLikes,
        musicsService,
        cacheService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'Sorry, there seems to be an issue with our server ...',
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
