// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
  const { cmd, value } = request
  if(cmd == 'openDisplayMode') {
    document.body.classList.add(value);
    sendResponse();
  } else if(cmd == 'closeDisplayMode') {
    document.body.classList.remove(value);
    sendResponse();
  } else {
    sendResponse(
      document.querySelector('.display-tag') ? 1 : 0
    )
  }
});