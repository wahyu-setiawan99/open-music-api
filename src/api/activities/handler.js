class ActivitesHandler {
  constructor(activitiesService, playlistsService) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistsService;
  }

  async getPlaylistActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // verify if the playlists access
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const activities = await this._activitiesService.getActivities(id);
    return {
      status: 'success',
      data: {
        playlistId: id,
        activities: activities.map((activity) => ({
          username: activity.username,
          title: activity.title,
          action: activity.action,
          time: activity.time,

        })),
      },
    };
  }
}

module.exports = ActivitesHandler;
