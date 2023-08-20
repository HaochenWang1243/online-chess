const redis = require('redis')
const dotenv = require('dotenv')
dotenv.config()

// const host=process.env.REDIS_HOST || "localhost"
// const port=process.env.RDDIS_PORT || 6379

// connect to redis on nodejs
// https://docs.redis.com/latest/rs/references/client_references/client_nodejs/

const redisClient=redis.createClient({
    socket:{
        port:'6379',
        host: process.env.REDIS_HOST || "localhost"
    }
})

async function connectToRedis(){
    try{
        await redisClient.connect();
        console.log('Connected to redis...')
    }
    catch(err){
        console.log(err.message)
        process.exit(1)
    }
}

module.exports={connectToRedis,redisClient}