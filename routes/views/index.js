const {Router} = require('express')

const router = Router()

router.get("/register",(req,res,next)=>{
    if(req.cookies.token)
        return res.redirect('/lobby')
    res.render('auth/register',{authorized:false})
})

router.get("/login",(req,res,next)=>{
    if(req.cookies.token)
        return res.redirect('/lobby')
    res.render('auth/login',{authorized:false})
})

router.get("/lobby",(req,res,next)=>{
    if(!req.cookies.token)
        return res.redirect('/login')
    res.render('lobby/index',{authorized:true})
})

router.get("/games",(req,res,next)=>{
    if(!req.cookies.token)
        return res.redirect('/login')
    res.render('games/index',{authorized:true})
})

router.get("/room",(req,res,next)=>{
    if(!req.cookies.token)
        return res.redirect('/login')
    res.render('room/index',{authorized:true})
})


module.exports = router