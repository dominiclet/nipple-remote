import { IonContent, IonIcon, IonPage } from '@ionic/react';
import styles from './Home.module.css';
import { volumeHighOutline, volumeLowOutline, playForwardOutline, playBackOutline, arrowForwardOutline, arrowBackOutline, ellipseOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from "socket.io-client";
import useDigitInput from "react-digit-input";

const fadeIn = (elementId: string) => {
  const element = document.getElementById(elementId) as HTMLElement;
  element.style.display = "block";
}

const Home: React.FC = () => {
  const [connected, setConnected] = useState<boolean>();
  const [value, onChange] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

  const [socket, setSocket] = useState<Socket|null>();
  const [rtcConnection, setRtcConnection] = useState<RTCPeerConnection|null>();
  const dataChannel = useRef<RTCDataChannel|null>();

  const url = process.env.REACT_APP_BACKEND_URL || "ws://localhost:5000";

  const digits = useDigitInput({
    acceptedCharacters: /^[0-9]$/,
    length: 6,
    value,
    onChange,
  });

  useEffect(() => {
    setRtcConnection(new RTCPeerConnection());
    setSocket(io(url));
  }, []);

  // To handle socket taking time to initialize?? (socket is undefined at first)
  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        setButtonDisabled(false);
      })
    }
  }, [socket]);

  // Connect button
  const handleConnect = () => {
    if (!rtcConnection || !socket) return;

    const channel = rtcConnection.createDataChannel("sendChannel");
    channel.onopen = () => {
      console.log("Data channel open");
          setTimeout(() => {
            (document.getElementById("pause") as HTMLElement).style.animationPlayState = "running"
          }, 500);
          setTimeout(() => fadeIn("volUp"), 2000);
          setTimeout(() => fadeIn("forward"), 2500);
          setTimeout(() => fadeIn("volDown"), 3000);
          setTimeout(() => fadeIn("backward"), 3500);

    };

    dataChannel.current = channel;
    rtcConnection.createOffer().then((offer) => {
      return rtcConnection.setLocalDescription(offer);
    }).then(() => {
      // Setup listeners
      socket.on("message", (data) => {
        const { type, sdp } = data;
        console.log("Received accept")
        switch (type) {
          // For acceptance message
          case "accept":
            rtcConnection.setRemoteDescription(new RTCSessionDescription(sdp));
            // Setup ice candidate
            setConnected(true);
            break
          
          // For ICE candidates
          case "ice-candidate":
            console.log("Received ice candidate")
            rtcConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
        }
      });

      // Send offer
      socket.send({
        type: "offer-connect",
        to: value,
        sdp: rtcConnection.localDescription,
      });
    });

    rtcConnection.onicecandidate = (event) => {
      console.log("NEW ICE")
      if (event.candidate) {
        socket.send({
          type: "ice-candidate",
          to: value,
          candidate: event.candidate,
        });
      }
    }
  }

  const handlePausePlay = () => {
    if (dataChannel.current) {
      dataChannel.current.send("pausePlay");
    }
  }

  const handleVolUp = () => {
    if (dataChannel.current) {
      dataChannel.current.send("volUp");
    }
  }

  const handleVolDown = () => {
    if (dataChannel.current) {
      dataChannel.current.send("volDown");
    }
  }

  const handleForward = () => {
    if (dataChannel.current) {
      dataChannel.current.send("forward");
    }
  }
  
  const handleBackward = () => {
    if (dataChannel.current) {
      dataChannel.current.send("backward");
    }
  }

  const handleSlow = () => {
    if (dataChannel.current)
      dataChannel.current.send("slow");
  }

  const handleFast = () => {
    if (dataChannel.current)
      dataChannel.current.send("fast");
  }

  const handleReset = () => {
    if (dataChannel.current)
      dataChannel.current.send("speedReset");
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className={styles.background}>
          {connected ?
            <div className={styles.remoteContainer}>
              <div className={styles.buttonsContainer}>
                <IonIcon id="volUp" onClick={handleVolUp} icon={volumeHighOutline} className={styles.volumeUp} />
                <IonIcon id="volDown" onClick={handleVolDown} icon={volumeLowOutline} className={styles.volumeDown} />
                <IonIcon id="forward" onClick={handleForward} icon={arrowForwardOutline} className={styles.forward} />
                <IonIcon id="backward" onClick={handleBackward} icon={arrowBackOutline} className={styles.backward} />
                <div id="pause" onClick={handlePausePlay} className={styles.pausePlay} />
              </div> 
              <div className={styles.speedContainer}>
                <IonIcon id="slow" onClick={handleSlow} icon={playBackOutline} className={styles.slow} />
                <IonIcon id="resetSpeed" onClick={handleReset} icon={ellipseOutline} className={styles.reset} />
                <IonIcon id="fast" onClick={handleFast} icon={playForwardOutline} className={styles.fast} />
              </div>
            </div>
            :
            <div className={styles.inputContainer}>
              <div className={styles.digitsContainer}>
                <input inputMode="decimal" autoFocus {...digits[0]} />
                <input inputMode="decimal" {...digits[1]} />
                <input inputMode="decimal" {...digits[2]} />
                <input inputMode="decimal" {...digits[3]} />
                <input inputMode="decimal" {...digits[4]} />
                <input inputMode="decimal" {...digits[5]} />
              </div>
              <button id="connect-button" disabled={buttonDisabled} onClick={handleConnect}>Connect</button>
            </div>
          }
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
