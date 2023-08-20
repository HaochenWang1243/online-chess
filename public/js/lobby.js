const lobby = document.getElementById('lobby')
const username = document.getElementById('username')
const rank = document.getElementById('rank')
const points = document.getElementById('points')
const beginnerRoom = document.getElementById('beginner-rooms')
const intermediateRoom = document.getElementById('intermediate-rooms')
const advancedRoom = document.getElementById('advanced-rooms')
const expertRoom = document.getElementById('expert-rooms')
const totalUsers = document.getElementById('total-users')
const totalRooms = document.getElementById('total-rooms')

let user

function fetchUserCallback(data){
    [username,rank,points].forEach((element)=>console.log(element == null))
    user = data
    console.log(`user is`)
    console.log(user)
    socket.emit('user-connected',user)
    socket.emit('send-total-rooms-and-users')
    
    lobby.classList.remove("hidden")
    username.innerText = user.username
    rank.innerText = user.user_rank
    points.innerText = user.user_points
    console.log('this line is reached: AWW')

    // TODO: hide spinner
    hideSpinner()
}

fetchData('/api/user-info', fetchUserCallback)

socket.on('receive-number-of-rooms-and-users',(respectiveRooms, totalR,totalU)=>{
    [beginnerRoom,
        intermediateRoom,
        advancedRoom,
        expertRoom,
        totalRooms,
        totalUsers].forEach((element)=>console.log(element == null))
    console.log(respectiveRooms)
    beginnerRoom.innerText = `${respectiveRooms[0]} rooms`
    intermediateRoom.innerText = `${respectiveRooms[1]} rooms`
    advancedRoom.innerText = `${respectiveRooms[2]} rooms`
    expertRoom.innerText = `${respectiveRooms[3]} rooms`
    
    totalRooms.innerText = `Total Rooms: ${totalR}`
    totalUsers.innerText = `Total Conneted Users: ${totalU}`

})