
function handlePausePlay() {
  let keydown = new KeyboardEvent("keydown", { key: "(space)", code: "32" });
  window.dispatchEvent(keydown);
}

function handleVolUp() {
  let keydown = new KeyboardEvent("keydown", { key: "up arrow", code: "38" });
  window.dispatchEvent(keydown);
}

function handleVolDown() {
  let keydown = new KeyboardEvent("keydown", { key: "down arrow", code: "40" });
  window.dispatchEvent(keydown);
}

function handleForward() {
  let keydown = new KeyboardEvent("keydown", { key: "right arrow", code: "39" });
  window.dispatchEvent(keydown);
}

function handleBackward() {
  let keydown = new KeyboardEvent("keydown", { key: "left arrow", code: "37" });
  window.dispatchEvent(keydown);
}

browser.runtime.onMessage((action) => {
  switch (action) {
    case "pausePlay":
      handlePausePlay();
      break;

    case "volUp":
      handleVolUp();
      break;

    case "volDown":
      handleVolDown();
      break;

    case "forward":
      handleForward();
      break;

    case "backward":
      handleBackward();
      break;
  }
});

console.log("Nipple remote injected")
