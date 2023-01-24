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
}) => ({
  id,
  name,
  year,
  title,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = { mapDBtoModel };
