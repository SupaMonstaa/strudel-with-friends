import { encode } from 'html-entities'

const messages = document.getElementById('messages')
var myUserId = ''
export function setMyUserId(userId) {
  myUserId = userId
}

export function add(userId, msg) {
  var item = document.createElement('li')
  if (myUserId === userId) {
    item.className = 'me'
    item.textContent = encode(`${userId}(me) : ${msg}`)
  } else {
    item.className = ''
    item.textContent = encode(`${userId}: ${msg}`)
  }
  messages.appendChild(item)
  //window.scrollTo(0, document.body.scrollHeight);
}
