// 获取当前选项卡ID
function getCurrentTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (callback) callback(tabs.length ? tabs[0].id : null);
  });
}

// // 向content-script主动发送消息
function sendMessageToContentScript(message, callback) {
  getCurrentTabId((tabId) => {
    chrome.tabs.sendMessage(tabId, message, function (response) {
      if (callback) callback(response);
    });
  });
}

function getCurrentMode() {
  return new Promise((resolve) => {
    sendMessageToContentScript({ cmd: "getCurrentMode" }, function (response) {
      resolve(response);
    });
  });
}

const bottomNode = document.querySelector("#bottom");
const switchNode = document.querySelector("#switch");

let isOpenDiplayMode;

getCurrentMode().then((value) => {
  isOpenDiplayMode = value;
  if (isOpenDiplayMode) {
    switchNode.checked = true;
  }
});

switchNode.addEventListener("click", function () {
  if (isOpenDiplayMode) {
    sendMessageToContentScript(
      { cmd: "closeDisplayMode" },
      function (response) {}
    );
    isOpenDiplayMode = 0;
  } else {
    sendMessageToContentScript(
      { cmd: "openDisplayMode" },
      function (response) {}
    );
    isOpenDiplayMode = 1;
    getCurrentTabId((tabId) => {
      chrome.scripting.insertCSS({
				target: {
					tabId,
					allFrames: true
				},
				files: ["css/main.css"]
   		});
		})
	}
});
