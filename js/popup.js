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

function getCurrentMode(value) {
  return new Promise((resolve) => {
    sendMessageToContentScript({ cmd: "getCurrentMode", value }, function (response) {
      resolve(response);
    });
  });
}

function subEvent(id, event, fn) {
  const el = document.querySelector(id)
  el.addEventListener(event, (e) => {
    fn(e, el)
  })
}


const bottomNode = document.querySelector("#bottom");
const switchNode = document.querySelector("#switch");

let isOpenDiplayMode;

const tags = ['div', 'span', 'a', 'li']

let initState = ['', '', '','']

getCurrentMode('.display-border').then((value) => {
  if(value) {
    document.querySelector('#BorderField').value = "1"
  } else {
    document.querySelector('#BorderField').value = "0"
  }
})

getCurrentMode('.display-tag').then((value) => {
  isOpenDiplayMode = value;
  if (isOpenDiplayMode) {
    document.querySelector('#bottom').style.display = 'block'
    switchNode.checked = true;
    // document.querySelectorAll('.checkbox-wrapper input').forEach(it => {
    //   it.disabled = ''
    // })
  } else {
    document.querySelector('#bottom').style.display = 'none'
    // document.querySelectorAll('.checkbox-wrapper input').forEach(it => {
    //   it.disabled = 'disabled'
    // })
  }
})

switchNode.addEventListener("click", function () {
  if (isOpenDiplayMode) {
    document.querySelector('#bottom').style.display = 'none'
    sendMessageToContentScript(
      { cmd: "closeDisplayMode", value: 'display-tag' },
      function (response) {}
    );
    isOpenDiplayMode = 0;
  } else {
    document.querySelector('#bottom').style.display = 'block'
   
    sendMessageToContentScript(
      { cmd: "openDisplayMode", value: 'display-tag' },
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

subEvent('#BorderField', 'change', e => {
  let index = document.querySelector('#BorderField').selectedIndex 
  if(index == 0) {
    sendMessageToContentScript(
      { cmd: "closeDisplayMode", value: 'display-border' },
      function (response) {}
    );
  } else {
    sendMessageToContentScript(
      { cmd: "openDisplayMode", value: 'display-border' },
      function (response) {}
    );
  }
})

subEvent('#repo', 'click', () => {
  chrome.tabs.create({url: 'https://github.com/peterroe/chrome-plugin-display-tag'});
})

// subEvent('#save', 'click', (_, el) => {
//   const content = el.value
//   const tags = content.split(',')  
// })


tags.forEach(it => {
  subEvent(`#display-${it}`, 'change' , (_, el) => {
    const val = el.checked
    if(val) {
      getCurrentTabId((tabId) => {
        chrome.scripting.insertCSS({
          target: {
            tabId,
            allFrames: true
          },
          css:
`
.display-tag ${it}::before {
  content: none !important;
}
.display-tag ${it}::after {
  content: none !important;
};
`
        });
      })
      chrome.storage.local.set({[it]: 'checked'}, function(items) {})
    } else {
      chrome.storage.local.set({[it]: ''}, function(items) {})
      getCurrentTabId((tabId) => {
        chrome.scripting.removeCSS({
          target: {
            tabId,
            allFrames: true
          },
          css: 
`
.display-tag ${it}::before {
  content: none !important;
}
.display-tag ${it}::after {
  content: none !important;
};
`
        });
      })
    }
  })
});

chrome.storage.local.get(tags, function(items) {
  tags.forEach((it, i) => {
    console.log(items.color, items.age);
    initState[i] = items[it]
    document.querySelector(`#display-${it}`).checked = items[it]
    getCurrentTabId((tabId) => {
      chrome.scripting.removeCSS({
        target: {
          tabId,
          allFrames: true
        },
        css: 
`
.display-tag ${it}::before {
  content: none !important;
}
.display-tag ${it}::after {
  content: none !important;
};
`
      });
    })
      if(items[it]) {
        getCurrentTabId((tabId) => {
          chrome.scripting.insertCSS({
            target: {
              tabId,
              allFrames: true
            },
            css: 
`
.display-tag ${it}::before {
  content: none !important;
}
.display-tag ${it}::after {
  content: none !important;
};
`
          });
        })
      }
  })
});
