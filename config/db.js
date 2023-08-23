const mysql = require("mysql2")
const dotenv= require("dotenv")

dotenv.config()

const user = process.env.MYSQL_USER
const password=process.env.MYSQL_PASSWORD
const host=process.env.MYSQL_HOST
const database=process.env.MYSQL_DATABASE
const port=process.env.MYSQL_PORT

const db=mysql.createConnection({
    user:'root',
    password:'root',
    host:'34.123.244.180',
    database:'online_chess',
    port:'3306'
    // user,host,password,port,database
})

module.exports = db