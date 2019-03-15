(function() {
  var lastPeerId = null;
  var peer = null;
  var conn = null;
  var recvId = document.getElementById("receiver-id");
  var recvIdInput = document.getElementById("peer-id");
  var status = document.getElementById("status");
  var message = document.getElementById("message");
  var sendMessageBox = document.getElementById("sendMessageBox");
  var sendButton = document.getElementById("sendButton");
  var connectButton = document.getElementById("connect-button");

  function initialize() {
    peer = new Peer(null, {
      debug: 2
    });

    peer.on("open", function(id) {
      if (peer.id === null) {
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
      console.log(peer);
      status.innerHTML = "Connected";
      ready();
    });

    peer.on("disconnect", function() {
      status.innerHTML = "Connection lost. Please reconnect.";

      peer.id = lastPeerId;
      peer._lastServerId = lastPeerId;
      peer.reconnect();
    });

    peer.on("close", function() {
      conn = null;
      status.innerHTML = "Connection destroyed. Please refresh";
      console.log("Connection destroyed");
    });

    peer.on("error", function() {
      console.log(err);
    });
  }

  function ready() {
    conn.on("data", function(data) {
      addMessage('<span class="peerMsg">Peer:</span>' + data);
    });

    conn.on("close", function() {
      status.innerHTML = "Connection reset<br>Awaiting connection...";
      conn = null;
      start(true);
    });
  }

  function join() {
    console.log("getting to join()");
    if (conn) {
      conn.close();
    }

    conn = peer.connect(recvIdInput.value, { reliable: true });
    console.log(peer);

    conn.on("open", function() {
      status.innerHTML = "Connected to: " + conn.peer;
    });

    conn.on("data", function(data) {
      addMessage('<span class="peerMsg">Peer:</span>' + data);
    });

    conn.on("close", function() {
      status.innerHTML = "Connection closed";
    });
  }

  function addMessage(msg) {
    console.log(msg);
    var now = new Date();
    var h = now.getHours();
    var m = addZero(now.getMinutes());
    var s = addZero(now.getSeconds());

    if (h > 12) {
      h -= 12;
    } else if (h === 0) {
      h = 12;
    }

    function addZero(t) {
      if (t < 10) {
        t = "0" + t;
      }

      return t;
    }

    message.innerHTML = `<br><span class="msg-time">${h}:${m}:${s}</span> -`
        + msg + message.innerHTML;
  }

  sendMessageBox.onkeypress = function(e) {
    var event = e || window.event;
    var char = event.which || event.keyCode;
    if (char === "13") {
      sendButton.click();
    }
  };

  sendButton.onclick = function() {
    if (conn.open) {
      var msg = sendMessageBox.value;
      sendMessageBox.value = "";
      conn.send(msg);
      addMessage('<span class="selfMsg">Self: </span>' + msg);
    }
  };

  connectButton.addEventListener("click", join);

  initialize();
})();
