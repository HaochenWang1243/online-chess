
// =============================
// DOM Elements
// =============================
const room  = document.getElementById('game-room')
const boxes = document.querySelectorAll('.box')
const playerLight = document.getElementById('player-light')
const playerBlack = document.getElementById('player-black')
const waitingMessage = document.getElementById('waiting-message')
const playerLightTimer = document.querySelector('.timer')
const playerBlackTimer = document.querySelector('.timer')
const lightCapturedPieces = document.getElementById('light-captured-pieces')
const blackCapturedPieces = document.getElementById('black-captured-pieces')
// const piecesToPromote = document.getElementById('pieces-to-promote')
// const piecesToPromoteContainer = document.getElementById('pieces-to-promote-container')
// const gameOverMessageContainer = document.getElementById('game-over-messsage-container')

// const winnerUsername = gameOverMessageContainer.querySelector('p strong')
// const myScoreElement = document.getElementById('my-score')
// const enemyScoreElement = document.getElementById('enemy-score')

// =============================
// Game Variables
// =============================
let user = null
let search = window.location.search.split('&')
let roomId = null
let password = null
let gameDetails = null
let gameHasTimer = false
let timer = null
let myTurn = true
let kingIsAttacked = false
let pawnToPromotePosition = null
let castling = null
let gameOver = false
let myScore = 0
let enemyScore = 0
let gameStartAtTimestamp = null

if(search.length > 1){
    roomId = search[0].split('=')[1]
    password = search[1].split('=')[1]
}else{
    roomId = search[0].split('=')[1]
}

function fetchUserCallback(data){
    user = data

    if(password){
        socket.emit('user-connected',user,roomId,password)
    }else{
        socket.emit('user-connected',user,roomId)
    }
    socket.emit('get-game-details',roomId,user)
}

fetchData('/api/user-info',fetchUserCallback)

// Display chess board
function displayChessPieces(){
    boxes.forEach(box => {
        box.innnerHTML = ''
    });

    lightPieces.forEach(piece => {
        let box = document.getElementById(piece.postion)
        box.innerHTML += `
            <div class="piece light" data-piece="${piece.piece}" data-points="${piece.points}">
                <img src="${piece.icon}" alt="" />
            </div>
        `
    })

    blackPieces.forEach(piece => {
        let box = document.getElementById(piece.postion)
        box.innerHTML += `
            <div class="piece black" data-piece="${piece.piece}" data-points="${piece.points}">
                <img src="${piece.icon}" alt="" />
            </div>
        `
    })
    addPiecelisteners()
}

function onClickPiece(e){
    if(!myTurn || gameOver) return

    hidePossibleMoves()

    let element = e.target.closest('.piece')
    let position = element.parentNode.id
    let piece = element.dataset.piece

    if(selectedPiece && selectedPiece.piece == piece && selectedPiece.position == position){
        hidePossibleMoves()
        selectedPiece = null 
        return      
    }

    // keep record of last cursor-selected piece for shade deletion purpose
    selectedPiece = {position, piece}

    let possibleMoves = findPossibleMoves(position, piece)
    
    console.log('position:'+position,'piece:'+piece)
    console.log(possibleMoves)

    showPossibleMoves(possibleMoves)
}

function addPiecelisteners(){
    
    document.querySelectorAll(`.piece.${player}`).forEach(piece=>{
        piece.addEventListener('click',onClickPiece)
    })

    document.querySelectorAll(`.piece.${enemy}`).forEach(piece=>{
        piece.style.cursor = 'default'
    })
}

// ----------------------------------------
// possible moves logic
function showPossibleMoves(possibleMoves){
    possibleMoves.forEach(box => {
        let possibleMoveBox = document.createElement('div')
        
        possibleMoveBox.classList.add('possible-move') // for css purpose
        possibleMoveBox.addEventListener('click', move)

        box.appendChild(possibleMoveBox)
    })
}

function hidePossibleMoves(){
    document.querySelectorAll('.possible-move').forEach(possibleMoveBox=>{
        possibleMoveBox.removeEventListener('click',move)
        possibleMoveBox.parentNode.removeChild(possibleMoveBox)
    })
}

function findPossibleMoves(position, piece){
    let [xAxisPos, yAxisPos] = position.split('-')
    
    let yAxisIndex = yAxis.findIndex(y=>y==yAxisPos)
    let xAxisIndex = xAxis.findIndex(x=>x==xAxisPos)

    switch(piece){
        case 'pawn':
            return getPawnPossibleMoves(xAxisPos, yAxisPos, xAxisIndex, yAxisIndex)
        case 'rook':
            return getRookPossibleMoves(xAxisPos, yAxisPos, xAxisIndex, yAxisIndex)    
        default:
            return []
    }
}


// ----------------------------------------
// Timer logic
function updateTimer(){

}

function timerEndedCallback(){

}
// ----------------------------------------
// Game logic
function setCursor(cursor){
    document.querySelectorAll(`.piece.${player}`).forEach(piece=>{
        piece.getElementsByClassName.cursor = cursor
    })
}

function startGame(user){
    playerBlack.querySelector('.usernmae').innerText = playerTwo.username

    waitingMessage.classList.add('hidden')
    playerBlack.classList.remove('hidden')

    displayChessPieces()
}

// ----------------------------------------
// Move logic
function move(e){
    let currentBox = document.getElementById(selectedPiece.position)
    let boxToMoveTo = e.target.parentNode
    let piece = currentBox.querySelector('.piece')

    hidePossibleMoves()

    let pieceToRemove = null
    let pieceToRemovePieceImg = null

    if(boxToMoveTo.children>0){
        if(boxToMoveTo.children[0].classList.contains(player)){
            // TODO: perform castling
            return
        }
        pieceToRemove = boxToMoveTo.children[0]
        pieceToRemovePieceImg = pieceToRemove.children[0]
    }else{
        // TODO: check for castling
    }
    currentBox.innerHTML = ''

    if(pieceToRemove){
        // TODO: capture piece
    }

    boxToMoveTo.appendChild(piece)

    let boxesNeededForCheck = {
        currentBox, boxToMoveTo
    }
    let piecesNeededForCheck={
        piece, pieceToRemove, pieceToRemovePieceImg
    }
    let isMovePossible = canMakeMove(boxesNeededForCheck, piecesNeededForCheck)

    if(!isMovePossible){
        return
    }


    // TODO: check for piece promotion and el passant
    // TODO: check for draw
    // TODO: end my turn
}

function canMakeMove({currentBox, boxToMoveTo}, {piece, pieceToRemove, pieceToRemovePieceImg}){
    // TODO: check if move is valid
    let moveIsNotValid = false

    if(moveIsNotValid){
        selectedPiece = null
        if(pieceToRemove){
            // TODO: undo everything
        }
    }

    return true
}
// ----------------------------------------
displayChessPieces()

// =============================
// Socket Listeners
// =============================

socket.on('receive-game-details', (details)=>{
    gameDetails = details

    let playerOne = gameDetails.players[0]

    gameHasTimer = gameDetails.time > 0
    if(gameHasTimer){
        playerLightTimer.innerText = gameDetails.time + ':00'
        playerBlackTimer.innerText = gameDetails.time + ':00'
    }else{
        playerLightTimer.classList.add('hidden')
        playerBlackTimer.classList.add('hidden')
    }

    playerLight.querySelector('.username').innerText = playerOne.username
    if(playerOne.username === user.username){
        player = 'light'
        enemy = 'black'

        myTurn = true
    }else{
        gameStartAtTimestamp = new Date().toISOString.slice(0,19).replace('T',' ')

        player = 'black'
        enemy = 'light'

        setCursor('default')
        startGame(user)
    }

    if(gameHasTimer){
        timer = new Timer(player, roomId, gameDetails, 0, updateTimer, timerEndedCallback)
    }

    hideSpinner()
    room.classList.remove('hidden')
})

// if we are 1st player and someone joined the room, then this event is emitted by the server
socket.on('game-started',(playerTwo)=>{
    gameStartAtTimestamp = new Date().toISOString.slice(0,19).replace('T',' ')
    startGame(playerTwo)

    if(gameHasTimer){
        timer.start()
    }
})
