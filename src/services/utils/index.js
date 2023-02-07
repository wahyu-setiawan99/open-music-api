/* eslint-disable camelcase */
const mapDBtoModel = ({
  id,
  name,
  year,
  title,
  genre,
  performer,
  duration,
  album_id,
  username,
  action,
  time,
  cover_url,
}) => ({
  id,
  name,
  year,
  title,
  genre,
  performer,
  duration,
  albumId: album_id,
  username,
  action,
  time,
  coverUrl: cover_url,
});

module.exports = { mapDBtoModel };
