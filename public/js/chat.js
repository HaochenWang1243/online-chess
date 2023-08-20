const openChatBtn= document.getElementById('open-chat')
const closeChatBtn = document.getElementById('close-chat')
const chat = document.getElementById('chat')
const chatForm = document.getElementById('chat-form')
const messageInput = document.getElementById('message-input')
const messages = document.getElementById('messages')


function displayMessage(message){
    messages.innerHTML +=`
    <li class="message">
    <span class="time">${message.created_at}</span>
    <p>
    <strong>${message.username}:</strong> ${message.text}
    </p>
    </li>
    `   
}

function handleSubmit(e){
    e.preventDefault()
    
    let text = messageInput.value
    messageInput.value = ""
    
    let date = new Date()
    let [dd,mm,yy,hour,minute] = [date.getDate(), date.getMonth(), date.getFullYear(),date.getHours(),date.getMinutes()]
    
    let message = {
        text,
        username: user.username,
        created_at: `${dd}/${mm}/${yy} ${hour}:${minute}`
    }

    displayMessage(message)

    if(typeof roomId !== 'undefined')
        socket.emit('send-message', text, user.username, roomId)
    else
        socket.emit('send-message', text, user.username)
}

openChatBtn.addEventListener('click',()=>{
    chat.classList.add('open')
})
closeChatBtn.addEventListener('click',()=>{
    chat.classList.remove('open')
})
chatForm.addEventListener('submit',handleSubmit)

socket.on('receive-message',(text,username,toEveryone=false)=>{
    if(typeof roomId !== 'undefined' && toEveryone)
        return
    
    let date = new Date()
    let [dd,mm,yy,hour,minute] = [date.getDate(), date.getMonth(), date.getHours(),date.getMinutes()]

    let message = {
        text: text,
        user: username,
        created_at: `${dd+1}/${mm+1}/${yy} ${hour}:${minute}`
    }

    displayMessage(message)
})


