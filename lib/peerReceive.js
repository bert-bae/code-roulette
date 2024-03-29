(function() {
  var lastPeerId = null;
  var peer = null;
  var peerId = null;
  var conn = null;
  var recvId = document.getElementById("receiver-id");
  var status = document.getElementById("status");
  var message = document.getElementById("message");
  var standbyBox = document.getElementById("standby");
  var goBox = document.getElementById("go");
  var fadeBox = document.getElementById("fade");
  var offBox = document.getElementById("off");
  var sendMessageBox = document.getElementById("sendMessageBox");
  var sendButton = document.getElementById("sendButton");
  var clearMsgsButton = document.getElementById("clearMsgsButton");

  function initialize() {
    peer = new Peer(null, {
      debug: 2
    });

    peer.on("open", function(id) {
      if (peer.id === null) {
        console.log("Received null id from peer open");
        peer.id = lastPeerId;
      } else {
        lastPeerId = peer.id;
      }

      console.log("ID: " + peer.id);

      recvId.innerHTML = "ID: " + peer.id;
      status.innerHTML = "Awaiting connection...";
    });

    peer.on("connection", function(c) {
      if (conn) {
        c.on("open", function() {
          c.send("Already connected to another client");
          setTimeout(function() {
            c.close();
          }, 500);
        });

        return;
      }

      conn = c;
      console.log("Connected to: " + conn.peer);
      status.innerHTML = "Connected";
      ready();
    });

    peer.on("disconnect", function() {
      status.innerHTML = "Connection lost. Please reconnect.";
      console.log("Connection lost. Please reconnect");

      peer.id = lastPeerId;
      peer._lastServerId = lastPeerId;
      peer.reconnect();
    });

    peer.on("close", function() {
      conn = null;
      status.innerHTML = "Connection destroyed. Please refresh.";
      console.log("Connection destroyed");
    });

    peer.on("error", function(err) {
      console.log(err);
      alert("" + err);
    });
  }

  function ready() {
    conn.on("data", function(data) {
      console.log("Data received");

      var cueString = '<span class="cueMsg">Cue: </span>';

      switch (data) {
        case "Go":
          go();
          addMessage(cueString + data);
          break;
        case "Fade":
          fade();
          addMessage(cueString + data);
          break;
        case "Off":
          off();
          addMessage(cueString + data);
          break;
        case "Reset":
          reset();
          addMessage(cueString + data);
          break;
        default:
          addMessage('<span class="peerMsg">Peer: </span>' + data);
          break;
      }
    });
    conn.on("close", function() {
      status.innerHTML = "Connection reset<br>Awaiting connection...";
      conn = null;
      start(true);
    });
  }
  function go() {
    standbyBox.className = "display-box hidden";
    goBox.className = "display-box go";
    fadeBox.className = "display-box hidden";
    offBox.className = "display-box hidden";
    return;
  }
  function fade() {
    standbyBox.className = "display-box hidden";
    goBox.className = "display-box hidden";
    fadeBox.className = "display-box fade";
    offBox.className = "display-box hidden";
    return;
  }
  function off() {
    standbyBox.className = "display-box hidden";
    goBox.className = "display-box hidden";
    fadeBox.className = "display-box hidden";
    offBox.className = "display-box off";
    return;
  }
  function reset() {
    standbyBox.className = "display-box standby";
    goBox.className = "display-box hidden";
    fadeBox.className = "display-box hidden";
    offBox.className = "display-box hidden";
    return;
  }

  function addMessage(msg) {
    var now = new Date();
    var h = now.getHours();
    var m = addZero(now.getMinutes());
    var s = addZero(now.getSeconds());
    if (h > 12) h -= 12;
    else if (h === 0) h = 12;
    function addZero(t) {
      if (t < 10) t = "0" + t;
      return t;
    }
    message.innerHTML =
      '<br><span class="msg-time">' +
      h +
      ":" +
      m +
      ":" +
      s +
      "</span>  -  " +
      msg +
      message.innerHTML;
  }
  function clearMessages() {
    message.innerHTML = "";
    addMessage("Msgs cleared");
  }
  // Listen for enter
  sendMessageBox.onkeypress = function(e) {
    var event = e || window.event;
    var char = event.which || event.keyCode;
    if (char == "13") {
      sendButton.click();
    }
  };
  // Send message
  sendButton.onclick = function() {
    if (conn.open) {
      var msg = sendMessageBox.value;
      sendMessageBox.value = "";
      conn.send(msg);
      console.log("Sent: " + msg);
      addMessage('<span class="selfMsg">Self: </span>' + msg);
    }
  };
  // Clear messages box
  clearMsgsButton.onclick = function() {
    clearMessages();
  };
  initialize();
})();
