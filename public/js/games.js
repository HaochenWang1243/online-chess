const gamesDivElement = document.getElementById("games")
const rankFilter = document.getElementById("filter")
const gameList = document.getElementById("games-list")
const noGameMessage = document.getElementById("no-games-message")

const createRoomBtn = document.getElementById("create-room")
const joinRoomBtn = document.getElementById("join-room")

const createRoomFormContainer = document.getElementById("create-room-form-container")
const createRoomForm = document.getElementById("create-room-form")
const roomId = document.getElementById("room-id")
const gameTime = document.getElementById("game-time")
const closeCreateRoomFormBtn = document.getElementById("close-create-form")
const passwordInputGroup = document.getElementById("password-input-group")
const addPassword = document.getElementById("add-password")
const roomPassword = document.getElementById("room-password")

const joinRoomFormContainer = document.getElementById("join-room-form-container")
const joinRoomForm = document.getElementById("join-room-form")
const roomPasswordJoin = document.getElementById("room-password-join")
const closeJoinRoomFormBtn = document.getElementById("close-join-form")

let elemets = [
    gamesDivElement,
    rankFilter,
    gameList,
    noGameMessage,
    createRoomBtn,
    joinRoomBtn,
    createRoomFormContainer,
    createRoomForm,
    roomId,
    gameTime,
    closeCreateRoomFormBtn,
    passwordInputGroup,
    addPassword,
    roomPassword,
    joinRoomFormContainer,
    joinRoomForm,
    roomPasswordJoin]
    elemets.forEach((element)=>console.log(element == null))

roomPassword.readOnly = true

let user
let gameId = null

const intervals = [0,15,30,45,60]

const fetchUserCallback = (data)=>{
    user= data
    socket.emit("user-connected",user)
    socket.emit("get-rooms",'all')

    gamesDivElement.classList.remove('hidden')

    hideSpinner()
}


function addJoinButtonListeners(){
    document.querySelectorAll(".game button").forEach(button => {
        if(!button.classList.contains("disabled")){
            button.addEventListener("click",e=>{
                let game = button.parentNode

                if(game.dataset.withpassword === 'true'){
                    gameId = game.id
                    joinRoomFormContainer.classList.remove('hidden')
                }else{
                    socket.emit('join-room', game.id, user)
                }
            })
        }
    })
}

function displayRooms(rooms){
    gameList.innerHTML = ''
    rooms.forEach(room => {
        let {username, user_rank} = room.players[0]
        let numberOfPlayersInRoom = room.players[1] ? 2 : 1
        let hasPassword = (room.password && room.password!=='') ? true : false

        gameList.innerHTML +=  `
        <li class="game" id='${room.id}' data-withpassword="${hasPassword}">
            <div class="user">
                <span>${username}</span>
                <span>(${user_rank.charAt(0).toUpperCase() + user_rank.slice(1)})</span>
            </div>
        
            <div class="users-in-room">${numberOfPlayersInRoom} / 2</div>
        
            <button ${numberOfPlayersInRoom === 2 ? "class='disabled'" : ""}>Join</button>
        </li>
        `
    })

    addJoinButtonListeners()

}

fetchData('/api/user-info',fetchUserCallback)


socket.on('receive-rooms',rooms=>{
    if(rooms.length>0){
        if(!noGameMessage.classList.contains('hidden'))
            noGameMessage.classList.add('hidden')
        gameList.classList.remove('hidden')
        console.log(rooms)
        displayRooms(rooms)
    }else{
        gameList.classList.add('hidden')
        noGameMessage.classList.remove('hidden')
    }
})


// filter room dropdown btn listener
rankFilter.addEventListener('change',e=>{
    socket.emit('get-rooms', e.target.value)
})

// add password or not toggling listener
addPassword.addEventListener('change',e=>{
    if(addPassword.checked){
        roomPassword.readOnly = false
        passwordInputGroup.classList.remove('disabled')
    }else{
        roomPassword.readOnly = true
        passwordInputGroup.classList.add('disabled')
    }
})

// create room listeners


createRoomBtn.addEventListener('click',e=>{
    createRoomFormContainer.classList.remove('hidden')
})

closeCreateRoomFormBtn.addEventListener('click',e=>{
    createRoomFormContainer.classList.add('hidden')
})

createRoomForm.addEventListener('submit', e=>{
    e.preventDefault()
    
    let id = roomId.value
    let time = intervals[+gameTime.value]
    
    if(addPassword.checked && roomPassword.value !== '')
    socket.emit('create-room', id, time, user, roomPassword.value)
    else
    socket.emit('create-room', id, time, user)
    
    createRoomFormContainer.classList.add('hidden')
})

// join room listeners
joinRoomBtn.addEventListener('click',e=>{
    joinRoomFormContainer.classList.remove('hidden')
})

closeJoinRoomFormBtn.addEventListener('click',e=>{
    joinRoomFormContainer.classList.add('hidden')
})

joinRoomForm.addEventListener('submit', e=>{
    e.preventDefault()
    
    if(roomId){
        const password = roomPasswordJoin.value
        socket.emit('join-room', gameId, user, password)
    }
})

// 
socket.on('room-created',()=>{
    if(addPassword.checked && roomPassword.value !== '')
        window.location.href = window.location.origin + '/room?id=' + roomId.value + '&password=' + roomPassword.value
    else
        window.location.href = window.location.origin + '/room?id=' + roomId.value 
})

console.log(`socket is ${socket}`)

socket.on('room-joined', (roomId, password=null) => {
    console.log(`here in game.js, password is ${password}`)
    if(password) 
        window.location.href = window.location.origin + '/room?id=' + roomId + '&password=' + password
    else
        window.location.href = window.location.origin + '/room?id=' + roomId 
})
