const {redisClient} = require('../config/redis')

//  roomObject = {
//      'room id' : {
//          "players": [user1, user2], 
//          'moves': [] , 
//          'time': 60 (in min),
//          'password': 'passsword',
//          'gameStarted': false
    // }
//  }

// map user.user_rank to indices in the array respective-rooms retrieved form redis
let numberOfRoomIndices = {
    'beginner':0,
    'Intermediate':1,
    'advanced':2,
    'expert':3,
}

async function createRoom(roomId,user,time,password=null){
    // create room object
    let room = {id:roomId, players: [null,null], moves:[], time, gameStarted:false}
    room.players[0] = user

    if(password)
        room.password = password
    else
        room.password = null

    // store a roomId -> room pair
    await redisClient.set(roomId, JSON.stringify(room))
    
    // update rooms, which is the array storing all room objects
    let reply = await redisClient.get('rooms')
    let rooms,index

    console.log('rooms at the beginning of adding a new room is:')
    console.log(rooms)
    console.log('now start adding a new room!!!')
    console.log(room)

    if(reply){ //an array of room objects
        console.log('if reply block executed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        rooms = JSON.parse(reply)
        index = rooms.length
        console.log('before pushing room to rooms, rooms is:')
        console.log(rooms)
        rooms.push(room)
        console.log('after pushing room to rooms, rooms is:')
        console.log(rooms)
    }else{
        console.log('else block executed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        index=0
        rooms = [room]
        console.log('after pushing room to rooms, rooms is:')
        console.log(rooms)
    }
    await redisClient.set('rooms',JSON.stringify(rooms))
    console.log('rooms is updated in Redis!!!!!below:')
    console.log(await redisClient.get('rooms'))

    // update roomIndices, which maps roomId to its room's index in rooms array
    reply = await redisClient.get('roomIndices')
    let roomIndices
    if(reply){
        roomIndices = JSON.parse(reply)
    }else{
        roomIndices = {}
    }
    roomIndices[`${roomId}`] = index
    await redisClient.set('roomIndices',JSON.stringify(roomIndices))
    
    // update total-rooms, which is total number of rooms
    reply = await redisClient.get('total-rooms')
    let totalRooms
    if(reply){
        totalRooms = parseInt(reply) + 1
    }else{
        totalRooms = 1
    }
    await redisClient.set('total-rooms',totalRooms)

    // update respective-rooms, which is an array of number of rooms of the 4 levels
    reply = await redisClient.get('respective-rooms')
    let respectiveRooms = [0, 0, 0, 0]
    if(reply){
        respectiveRooms = JSON.parse(reply)
    }
    respectiveRooms[numberOfRoomIndices[user.user_rank]] += 1
    await redisClient.set('respective-rooms',JSON.stringify(respectiveRooms))
}   

// update all variables in the function above when a user joins the room with roomId
async function joinRoom(roomId,user){ 
    // update roomId- room pair
    let reply = await redisClient.get(roomId)
    if(reply){
        let room = JSON.parse(reply)
        room.players[1] = user
        await redisClient.set(roomId, JSON.stringify(room))
        
        // upate rooms array, using the map roomId -> index in rooms 
        reply = await redisClient.get('rooms')
        if(reply){
            let rooms = JSON.parse(reply)
            reply  = await redisClient.get('roomIndices')
            if(reply){
                let roomIndices = JSON.parse(reply)
                rooms[roomIndices[roomId]].players[1] = user
                await redisClient.set('rooms',JSON.stringify(rooms))
            }
        }
    }
}

// update all variables in the function above when a room is deleted
async function removeRoom(roomId,userRank){
    await redisClient.del(roomId)

    // delete the index in roomIndices
    let reply = await redisClient.get('roomIndices')
    if(reply){
        let roomIndices = JSON.parse(reply)
        delete roomIndices[roomId]

        reply = await redisClient.get('rooms')
        if(reply){
            let rooms = JSON.parse(reply)
            rooms.splice(roomIndices[roomId],1)

            await redisClient.set('rooms',JSON.stringify(rooms))
            await redisClient.set('roomIndices',JSON.stringify(roomIndices))
        }
    }

    // minus total-rooms by 1
    reply = await redisClient.get('total-rooms')
    if(reply){
        let totalRooms = parseInt(reply) - 1    
        await redisClient.set('total-rooms',totalRooms+"")
    }

    // minus correspondign entry in respective-rooms by 1
    reply =await redisClient.get('respective-rooms')
    if(reply){
        let respectiveRooms = JSON.parse(reply)
        respectiveRooms[numberOfRoomIndices[userRank]] -= 1
        await redisClient.set('respective-rooms',JSON.stringify(respectiveRooms))
    }
}

async function createTestingRooms(){
    const user1 = {
        username: "testuser",
        user_rank: 'beginner',
        user_points:1000,
        room:null
    }
    const user2 = {
        username: "testuser2",
        user_rank: 'expert',
        user_points:1000,
        room:null
    }

    await createRoom('room1',user1,0)
    await createRoom('room2',user2,0,'password')
    
}

module.exports = {createRoom, removeRoom, joinRoom, createTestingRooms}