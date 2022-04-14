const connectButton = document.getElementById("connect-button");
const uidDisplay = document.getElementById("uid");
const errorMsg = document.getElementById("error-msg");

// Query background script if connection established
browser.runtime.sendMessage({
  type: "connection-exists-query",
});

// Handles connect button
connectButton.onclick = () => {
  connectButton.style.display = "none";
  browser.runtime.sendMessage({
    type: "establish-connection",
  });
}

browser.runtime.onMessage.addListener((message) => {
  const { type } = message;

  switch (type) {
    case "connection-exists-query":
      if (!message.connection) {
        connectButton.style.display = "block";
      }
      break;

    case "request-id":
      const uid = message.allocatedNo;
      uidDisplay.innerText = uid;
      uidDisplay.style.display = "block";
      break;
  }
})

