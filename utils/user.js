const {redisClient} = require('../config/redis');
/*
connected_user object = {
    socket_id:{
        "username" : "testuser",
        'user_rank': 'beginner',
        'user_points':1000,
        'room':null
    }
}
*/

// Callback-based functions are incompatible with promises & async/await because they are different approaches to writing asynchronous code.
// https://maximorlov.com/using-callbacks-with-async-await/
const newUserConnection = async (socketId, user, roomId=null)=>{
    if(roomId)
        user.room = roomId;
    
    await redisClient.set(socketId,JSON.stringify(user));

    let reply = await redisClient.get('total-users')
    if(reply){
        let totalUsers = parseInt(reply)
        totalUsers+=1;
        await redisClient.set('total-users',JSON.stringify(totalUsers));
    }else{
        await redisClient.set('total-users','1');
    }
}

const removeUserConnection = async (socketId)=>{
    await redisClient.del(socketId)
    let reply = await redisClient.get('total-users')
    if(reply){
        let totalUsers = parseInt(reply)
        totalUsers-=1;
        if(totalUsers==0)
            await redisClient.del('total-users')
        else
            await redisClient.set('total-users',JSON.stringify(totalUsers));
    }
}

module.exports = {removeUserConnection, newUserConnection}