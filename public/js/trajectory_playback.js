// Generated by CoffeeScript undefined
var animate, loadRobot, loadTrajectory, togglePlay;

window.playback = {};

playback.possible_states = ['NOT_LOADED', 'LOADING', 'LOADED', 'PLAYING', 'REQUEST_STOP', 'STOPPED', 'DONE_PLAYING'];

playback.state = 'NOT_LOADED';

playback.filename = null;

window.param = 30;

loadTrajectory = function(filename, callback) {
  console.log('loadTrajectory');
  return $.ajax({
    type: "GET",
    url: filename,
    dataType: "text",
    success: function(allText) {
      var allTextLines, data, headers, line, n, _i, _len;
      allText = allText.replace('\r\n', '\n');
      allText = allText.replace('\n\r', '\n');
      allTextLines = allText.split('\n');
      headers = allTextLines.shift().split('\t');
      data = [];
      for (_i = 0, _len = allTextLines.length; _i < _len; _i++) {
        line = allTextLines[_i];
        if (line.trim() !== "") {
          data.push((function() {
            var _j, _len1, _ref, _results;
            _ref = line.split('\t');
            _results = [];
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              n = _ref[_j];
              _results.push(parseFloat(n));
            }
            return _results;
          })());
        }
      }
      return callback(headers, data);
    }
  });
};

loadRobot = function() {
  var callback;
  window.c = new WebGLRobots.DefaultCanvas('#hubo_container');
  return window.hubo = new Hubo('hubo2', callback = function() {
    c.add(hubo);
    return hubo.autorender = false;
  });
};

togglePlay = function() {
  if (playback.state === 'DONE_PLAYING') {
    playback.frame = 0;
  }
  switch (playback.state) {
    case 'LOADED':
    case 'STOPPED':
    case 'DONE_PLAYING':
      playback.state = 'PLAYING';
      playback.startedTime = window.performance.now() - playback.frame / playback.framerate * 1000;
      requestAnimationFrame(animate);
      window.numframes = 0;
      break;
    case 'PLAYING':
      playback.state = 'REQUEST_STOP';
  }
};

animate = function(timestamp) {
  var delta, delta_post, i, process_time, prop;
  if (playback.state === 'REQUEST_STOP') {
    playback.state = 'STOPPED';
    return;
  }
  delta = timestamp - playback.startedTime;
  playback.frame = Math.round(delta * playback.framerate / 1000);
  if (playback.frame > playback.data.length) {
    playback.state = 'DONE_PLAYING';
    return;
  }
  for (prop in playback.working_headers) {
    i = playback.working_headers[prop];
    if (prop.slice(0, 2) === "LF" || prop.slice(0, 2) === "RF") {
      hubo.motors[prop].value -= playback.data[playback.frame][i] / window.param;
    } else {
      hubo.motors[prop].value = playback.data[playback.frame][i];
    }
  }
  delta_post = window.performance.now() - playback.startedTime;
  process_time = delta_post - delta;
  window.numframes++;
  c.render();
  requestAnimationFrame(animate);
};

loadRobot();