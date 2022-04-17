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

              receiveChannel.onmessage = async (event) => {
                const action = event.data;

                switch (action) {
                  case "pausePlay":

                    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
                    console.log(tabs);
                    var tab = tabs[0];
                    browser.tabs.executeScript(
                      tab.id, {
                        code: '\
                          if (document.getElementsByTagName("video")[0].paused) document.getElementsByTagName("video")[0].play(); else document.getElementsByTagName("video")[0].pause();\
                        ',
                      }
                    )
                    break

                  case "volUp":
                    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
                    var tab = tabs[0];
                    browser.tabs.executeScript(
                      tab.id, {
                        code: '(() => {\
                          let videoElem = document.getElementsByTagName("video")[0];\
                          videoElem.volume += 0.2;\
                        })()'
                      }
                    )

                    break

                  case "volDown":
                    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
                    var tab = tabs[0];
                    browser.tabs.executeScript(
                      tab.id, {
                        code: '(() => {\
                          let videoElem = document.getElementsByTagName("video")[0];\
                          videoElem.volume -= 0.2;\
                        })()'
                      }
                    )
                    break

                  case "forward":
                    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
                    var tab = tabs[0];
                    browser.tabs.executeScript(
                      tab.id, {
                        code: '(() => {\
                          var s = document.createElement("script");\
                          s.src = browser.extension.getURL("scripts/playerForward.js");\
                          (document.head||document.documentElement).appendChild(s);\
                          s.onload = function() {\
                            s.remove();\
                          }\
                        })()'
                      }
                    )
                    break

                  case "backward":
                    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
                    var tab = tabs[0];
                    browser.tabs.executeScript(
                      tab.id, {
                        code: '(() => {\
                          var s = document.createElement("script");\
                          s.src = browser.extension.getURL("scripts/playerBackward.js");\
                          (document.head||document.documentElement).appendChild(s);\
                          s.onload = function() {\
                            s.remove();\
                          }\
                        })()'
                      }
                    )
                    break

                  case "fast":
                    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
                    var tab = tabs[0];
                    browser.tabs.executeScript(
                      tab.id, {
                        code: '(() => {\
                          var s = document.createElement("script");\
                          s.src = browser.extension.getURL("scripts/playerFast.js");\
                          (document.head||document.documentElement).appendChild(s);\
                          s.onload = function() {\
                            s.remove();\
                          }\
                        })()'
                      }
                    )
                    break

                  case "slow":
                    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
                    var tab = tabs[0];
                    browser.tabs.executeScript(
                      tab.id, {
                        code: '(() => {\
                          var s = document.createElement("script");\
                          s.src = browser.extension.getURL("scripts/playerSlow.js");\
                          (document.head||document.documentElement).appendChild(s);\
                          s.onload = function() {\
                            s.remove();\
                          }\
                        })()'
                      }
                    )
                    break

                  case "speedReset":
                    var tabs = await browser.tabs.query({ currentWindow: true, active: true });
                    var tab = tabs[0];
                    browser.tabs.executeScript(
                      tab.id, {
                        code: '(() => {\
                          var s = document.createElement("script");\
                          s.src = browser.extension.getURL("scripts/playerSpeedReset.js");\
                          (document.head||document.documentElement).appendChild(s);\
                          s.onload = function() {\
                            s.remove();\
                          }\
                        })()'
                      }
                    )
                    break
                }
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

