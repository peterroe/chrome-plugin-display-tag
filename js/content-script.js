// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
  if(request.cmd == 'openDisplayMode') {
    document.body.classList.add('display-tag');
    sendResponse();
  } else if(request.cmd == 'closeDisplayMode') {
    document.body.classList.remove('display-tag');
    sendResponse();
  } else {
    sendResponse(
      document.querySelector('.display-tag') ? 1 : 0
    )
  }
});