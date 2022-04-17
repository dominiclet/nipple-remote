setTimeout(() => {
  let videoPlayer = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
  let player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0]);
  player.setPlaybackRate(player.getPlaybackRate() + 0.5);
}, 0);
