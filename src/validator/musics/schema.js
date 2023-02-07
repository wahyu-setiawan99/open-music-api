const Joi = require('joi');

const MusicsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().min(1945).max(2023)
    .required(),
});

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1945).max(2023)
    .required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

module.exports = { MusicsPayloadSchema, SongPayloadSchema };
