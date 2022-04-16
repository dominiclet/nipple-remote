setTimeout(() => {
  let videoPlayer = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
  let player = videoPlayer.getVideoPlayerBySessionId(videoPlayer.getAllPlayerSessionIds()[0]);
  player.seek(player.getCurrentTime() + 5000);
}, 0);
