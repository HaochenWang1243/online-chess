const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db=require('../../config/db')
const {validationResult}=require('express-validator')
const redisClient=require('../../config/redis')
const cookieParser=require('cookie-parser')
require('dotenv').config()

const jwtSecret = process.env.JWT_SECRET

module.exports.register=(req,res)=>{
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty())
            return res.redirect('/register?error='+errors.array()[0].msg)
        
        const {username,email,password,confirmPassword}=req.body
        if(password!==confirmPassword)
            return res.redirect('/register?error=password do not match')
        
        // username,email,password,confirmPassword are legitimate, store to db
        let mysqlQuery=`SELECT id FROM users WHERE username='${username}' OR email='${email}'`
        db.query(mysqlQuery,async (err,result)=>{
            if(err) throw err
            if(result.length > 0)
                return res.redirect('/register?error=Username or email is already taken!')
            const salt=await bcrypt.genSalt()
            const encryptedPassword = await bcrypt.hash(password,salt)
            
            let mysqlQuery = `CALL createUser ('${username}','${email}','${encryptedPassword}')`
            db.query(mysqlQuery,(err,result)=>{
                if (err) throw err
                
                let mysqlQuery = `SELECT id FROM users WHERE email='${email}'`
                db.query(mysqlQuery,(err,result)=>{
                    if(err) throw err
                    if(result.length===0)
                        // res.status(500).send('Something went wrong!')
                        res.redirect('/register?error=Something went wrong!')  
                    console.log(result)
                    let userId = result[0].id
                    const payload={id:userId,username:username,email:email}
                    jwt.sign(payload,jwtSecret,(err,token)=>{
                        if(err) throw err
                        res.cookie('token',token,{maxAge:1000*60*60*24*30*6,httpOnly:false,secure:false,sameSite:'strict'})
                        res.cookie('user_rank','beginner',{maxAge:1000*60*60*24*30*6,httpOnly:false,secure:false,sameSite:'strict'})
                        res.cookie('user_points',1000,{maxAge:1000*60*60*24*30*6,httpOnly:false,secure:false,sameSite:'strict'})
                        res.redirect('/lobby?success=you have registered yourself successfully')
                    })
                })
            })
        })
    }
    catch(err){
        console.log(err)
        // res.status(500).json({error:err.message})
        res.redirect('/register?error=Something went wrong!')
    }
}
module.exports.login = (req,res,next)=>{
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty())
            return res.redirect('/login?error='+errors.array()[0].msg)
        
        const {email,password}=req.body
        
        let mysqlQuery = `SELECT * FROM users WHERE email='${email}'`
        db.query(mysqlQuery,async (err,result)=>{
            if(err) throw err
            if(result.length===0)        
                res.redirect('/login?error=Something went wrong!')
            const user = result[0]
            if(await bcrypt.compare(password,user.password)){
                const payload = {id:user.id,username:user.username,email:user.email}
                
                let mysqlQuery = `SELECT * FROM user_info WHERE user_id=${user.id}`
                db.query(mysqlQuery,async (err,result)=>{
                    if(err) throw err
                    const user_info = result[0]
                    jwt.sign(payload,jwtSecret,(err,token)=>{
                        res.cookie('token',token,{maxAge:1000*60*60*24*30*6,httpOnly:false,secure:false,sameSite:'strict'})
                        res.cookie('user_rank',user_info.user_rank,{maxAge:1000*60*60*24*30*6,httpOnly:false,secure:false,sameSite:'strict'})
                        res.cookie('user_points',user_info.user_points,{maxAge:1000*60*60*24*30*6,httpOnly:false,secure:false,sameSite:'strict'})
                        res.redirect('/lobby?success=you have logged in successfully')
                    })
                })
            }
            else{
                res.redirect('/login?error=email or password is incorrect')
            }
        })
    }
    catch(err){
        console.log(err)
        // res.status(500).json({error:err.message})
        res.redirect('/login?error=Something went wrong!')
    }
}
module.exports.getInfo = (req,res,next)=>{
    try{
        jwt.verify(req.cookies.token,jwtSecret,(err,userPayload)=>{
            if(err) throw err
            const {id,email,username} = userPayload
            let user = {
                id,
                email,
                username,
                user_points:req.cookies.user_points,
                user_rank:req.cookies.user_rank
            }
            return res.json(user)
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json({error: err.message})
    }
}