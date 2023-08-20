const express = require('express')
const db=require('./config/db')
const cookieParser=require('cookie-parser')
const dotenv = require('dotenv')
dotenv.config()
const path = require('path')
const http = require('http')
const {connectToRedis,redisClient} = require('./config/redis')
const socketIO = require('socket.io')
const util = require('node:util')
const viewRoutes = require('./routes/views/index')
const userRoutes = require('./routes/api/user')
const {newUserConnection, removeUserConnectionr} = require('./utils/user')
const { createTestingRooms, createRoom, joinRoom } = require('./utils/room')
// express project folder structure best practices

// controllers: middlewares that files in routes folder mount
// routes: middlewares that server.js mounts
// views: contains template engines files for rendering
// public/js: files to be reference in view engine files for non-request interaction

const app=express()
const server = http.createServer(app)

// console.log(util.getSystemErrorName(-111))
db.connect((err)=>{
    if(err){
        console.log(err)
        process.exit(1)
    }
    console.log("Connected to mysql database...")
})

connectToRedis()

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
// app.use([path,] callback [, callback...]): path defaults to '/'!
app.use(express.static(path.join(__dirname,'public')))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser('secret'))

app.use('/',viewRoutes)
app.use('/api',userRoutes)

const io = socketIO(server) 
io.on('connection',async (socket)=>{
    console.log(socket.id)
    try{
        socket.on('user-connected',async (user, roomId=null, passsword=null)=>{
            // if the querying URL user typed in contains roomId
            if(roomId){
                let reply = await redisClient.get(roomId)
                if(reply){
                    let room = JSON.parse(reply)
                    if(room.gameStarted){
                        socket.emit('error','The room is full')
                        return
                    }else if(room.password && (!password || room.password)){
                        socket.emit('error', 'To join the room you need the correct password')
                        return
                    }
                    socket.join(roomId)
                    newUserConnection(socket.id,user,roomId)  
                    
                    // if the user who just connected isn't the creator of the room he/she wants to join 
                    if(room.players[0].username == user.username){
                        return
                    }
                    // if the user who just connected isn't the one who joined the room either, let him/her be
                    // otherwise, the user who just connected must be room.player[1]
                    if(room.players[1] === null){
                        room.players[1]= user
                    }
                    
                    room.gameStarted = true
                    await redisClient.set(roomId, JSON.stringify(room))
                    socket.to(roomId).emit('game-started')

                    reply = await redisClient.get('roomIndices')
                    if(reply){
                        let roomIndices = JSON.parse(reply)
                        reply = await redisClient.get('rooms')
                        if(reply){
                            let rooms = JSON.parse(reply) 
                            rooms[roomIndices[roomId]] = room
                            await redisClient.set('rooms', JSON.stringify(rooms))
                        }
                    }
                }else{
                    socket.emit('error', 'the room does not exist')
                }
            }else{
                // why use sockerID as key for user info in newUserConnection()? socket.id is new every new connection instead new user!
                // if just use user.id, then we can:
                // if(await redisClient.get(user.id) == null)
                newUserConnection(socket.id,user)
                console.log(`socket.id=${socket.id}`)
            }
        })
        
        socket.on('get-game-details', async (roomId,user)=>{
            let reply = await redisClient.get(roomId)
            if(reply){
                let room  = JSON.parse(reply)
                let details = {players: room.players, time: room.time}

                socket.emit('receive-game-details', details)
            }
        })

        socket.on('send-total-rooms-and-users', async ()=>{
            let [totalUsers, totalRooms] = [0,0]
            let respectiveRooms = [0,0,0,0]
            
            let reply = await redisClient.get('total-users')
            if(reply) totalUsers = parseInt(reply)

            reply = await redisClient.get('total-rooms')
            if(reply) totalRooms = parseInt(reply)
            
            reply = await redisClient.get('respective-rooms')                
            if(reply) respectiveRooms = JSON.parse(reply)
            
            socket.emit('receive-number-of-rooms-and-users',respectiveRooms,totalRooms,totalUsers)
        })

        socket.on('create-room', async (roomId, time, user, password=null)=>{
            let reply = await redisClient.get(roomId)
            if(reply){
                socket.emit('error', `Room with id ${roomId} already exists!`)
            }else{
                if(password)
                    createRoom(roomId, user, time, password)
                else
                    createRoom(roomId, user, time)
                socket.emit('room-created')
            }
        })

        socket.on('join-room', async (roomId, user, password=null)=>{
            let reply = await redisClient.get(roomId)
            if(reply){
                let room = JSON.parse(reply)
                if(room.players[1] == null){
                    if(room.password && (!password || room.password != password)){
                        socket.emit('error', 'Join Room - Password incoreect.')
                    }else{
                        await joinRoom(roomId, user)
                        if(room.password && password !== ''){
                            console.log(`if block entered, password is ${password}`)
                            socket.emit('room-joined', roomId, password)
                        }else{
                            console.log(`else block entered, password is ${password}`)
                            socket.emit('room-joined', roomId)
                        }
                    }
                }else{
                    console.log(room)
                    socket.emit('error', 'room is full!')
                }
            }else{
                socket.emit('error',`Room with id ${roomId} does not exist!`)
            }
        })


        socket.on('get-rooms', async (rank)=>{
            // await createTestingRooms()
            let reply = await redisClient.get('rooms')
            if(reply){
                let rooms = JSON.parse(reply)
                if(rank == 'all'){
                    socket.emit('receive-rooms', rooms)
                }else{
                    let filteredRooms = rooms.filter(room => room.players[0].user_rank == rank)
                    socket.emit('receive-rooms',filteredRooms)
                } 
            }else{
                socket.emit('receive-rooms', [])
            }
        })

        socket.on('send-message',(text, username, roomId=null)=>{
            if(roomId)
                socket.to(roomId).emit('receive-message',text, username)
            else
                socket.broadcast.emit('receive-message',text,username)
        })

        socket.on('disconnet',async ()=>{
            let reply = redisClient.get(socket.id)
            if(reply){
                let user = JSON.parse(reply)
                if(user.room){
                    // TODO: remove user's room
                }
            }
            removeUser(socket.id)
        })
    }catch(err){
            console.log('this error!')
            throw err
    }
})

const PORT = process.env.PORT || 7000
server.listen(PORT,(req,res,next)=>console.log(`server started at http://localhost:${PORT}`))