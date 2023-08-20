const express = require('express')
const app = express()
const {redisClient,connectToRedis} = require('./config/redis');

async function main(){
  await connectToRedis()
  await redisClient.set('we','234')
  console.log(await redisClient.get('we'))
}

main()