const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');
const config = require('../services/utils/config');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, config.postgre.accessToken),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, config.postgre.refreshToken),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, config.postgre.refreshToken);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token is not valid');
    }
  },
};

module.exports = TokenManager;
