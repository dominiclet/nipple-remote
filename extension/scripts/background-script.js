import io from "socket.io-client";

let socket;
let rtcConnection;

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type } = message;

  switch (type) {
    case "connection-exists-query":
      if (!socket) browser.runtime.sendMessage({
        type: "connection-exists-query",
        connection: false,
      });
      else {
        socket.send({ type: "request-id" });
        browser.runtime.sendMessage({
          type: "connection-exist-query",
          connection: true,
        })
      }
      break;
    case "establish-connection":
      // Try to establish socket connection first
      try {
        socket = io("ws://localhost:5000");
      } catch (e) {
        console.log(e);
        sendResponse({
          connection: false,
        });
        break;
      }

      // Set-up handling of incoming messages
      socket.on("message", (msg) => {
        var { type } = msg;
        switch (type) {
          case "request-id":
            const { success, id } = msg;
            if (success) {
              browser.runtime.sendMessage({
                type: "request-id",
                allocatedNo: id, 
              })
            }
            break;
          case "offer-connect":
            const { sdp, from } = msg;
            rtcConnection = new RTCPeerConnection();

            // Prepare and send accept
            rtcConnection.setRemoteDescription(new RTCSessionDescription(sdp))
              .then(() => rtcConnection.createAnswer())
              .then(answer => rtcConnection.setLocalDescription(answer))
              .then(() => 
                socket.send({
                  type: "answer",
                  sdp: rtcConnection.localDescription,
                  to: from,
                })
              );

            // Handle ice candidate
            rtcConnection.onicecandidate = (event) => {
              if (event.candidate && rtcConnection.currentRemoteDescription) {
                socket.send({
                  type: "ice-candidate",
                  to: from,
                  candidate: event.candidate,
                });
              }
            }

            // Handle data channel
            rtcConnection.ondatachannel = (event) => {
              const receiveChannel = event.channel;
              console.log("Received data channel")

              receiveChannel.onmessage = (event) => {
                console.log(event.data);
              };
            }

            break;

          // Handle receiving ice candidate 
          case "ice-candidate":
            console.log("Received ice candidate");
            var { candidate } = msg;
            rtcConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      })

      // Request uid from server
      const req = {
        type: "request-id",
      };

      socket.send(req);

      break;
  }
});

