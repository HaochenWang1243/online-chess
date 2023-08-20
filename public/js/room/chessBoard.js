const xAxis = ['A','B','C','D','E','F','G','H']
const yAxis = [1,2,3,4,5,6,7,8]

let player = 'light'
let enemy = null

let isLeftCastlingPerformed = false
let isRightCastlingPerformed = false

let selectedPiece = null
const lightPieces = [
    {
        postion: 'A-8',
        icon: '../assets/chess-icons/light/chess-rook-light.svg',
        points: 5,
        piece: 'rook'
    },
    {
        postion: 'B-8',
        icon: '../assets/chess-icons/light/chess-knight-light.svg',
        points: 3,
        piece: 'knight'
    },
    {
        postion: 'C-8',
        icon: '../assets/chess-icons/light/chess-bishop-light.svg',
        points: 3,
        piece: 'bishop'
    },
    {
        postion: 'D-8',
        icon: '../assets/chess-icons/light/chess-queen-light.svg',
        points: 9,
        piece: 'queen'
    },
    {
        postion: 'E-8',
        icon: '../assets/chess-icons/light/chess-king-light.svg',
        points: 10,
        piece: 'king'
    },
    {
        postion: 'F-8',
        icon: '../assets/chess-icons/light/chess-bishop-light.svg',
        points: 3,
        piece: 'bishop'
    },
    {
        postion: 'G-8',
        icon: '../assets/chess-icons/light/chess-knight-light.svg',
        points: 3,
        piece: 'knight'
    },
    {
        postion: 'H-8',
        icon: '../assets/chess-icons/light/chess-rook-light.svg',
        points: 5,
        piece: 'rook'
    },

    // pawn
    
    {
        postion: 'A-7',
        icon: '../assets/chess-icons/light/chess-pawn-light.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'B-7',
        icon: '../assets/chess-icons/light/chess-pawn-light.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'C-7',
        icon: '../assets/chess-icons/light/chess-pawn-light.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'D-7',
        icon: '../assets/chess-icons/light/chess-pawn-light.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'E-7',
        icon: '../assets/chess-icons/light/chess-pawn-light.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'F-7',
        icon: '../assets/chess-icons/light/chess-pawn-light.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'G-7',
        icon: '../assets/chess-icons/light/chess-pawn-light.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'H-7',
        icon: '../assets/chess-icons/light/chess-pawn-light.svg',
        points: 1,
        piece: 'pawn'
    },
]

const blackPieces = [
    {
        postion: 'A-1',
        icon: '../assets/chess-icons/black/chess-rook-black.svg',
        points: 5,
        piece: 'rook'
    },
    {
        postion: 'B-1',
        icon: '../assets/chess-icons/black/chess-knight-black.svg',
        points: 3,
        piece: 'knight'
    },
    {
        postion: 'C-1',
        icon: '../assets/chess-icons/black/chess-bishop-black.svg',
        points: 3,
        piece: 'bishop'
    },
    {
        postion: 'D-1',
        icon: '../assets/chess-icons/black/chess-queen-black.svg',
        points: 9,
        piece: 'queen'
    },
    {
        postion: 'E-1',
        icon: '../assets/chess-icons/black/chess-king-black.svg',
        points: 10,
        piece: 'king'
    },
    {
        postion: 'F-1',
        icon: '../assets/chess-icons/black/chess-bishop-black.svg',
        points: 3,
        piece: 'bishop'
    },
    {
        postion: 'G-1',
        icon: '../assets/chess-icons/black/chess-knight-black.svg',
        points: 3,
        piece: 'knight'
    },
    {
        postion: 'H-1',
        icon: '../assets/chess-icons/black/chess-rook-black.svg',
        points: 5,
        piece: 'rook'
    },

    // pawn
    
    {
        postion: 'A-2',
        icon: '../assets/chess-icons/black/chess-pawn-black.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'B-2',
        icon: '../assets/chess-icons/black/chess-pawn-black.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'C-2',
        icon: '../assets/chess-icons/black/chess-pawn-black.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'D-2',
        icon: '../assets/chess-icons/black/chess-pawn-black.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'E-2',
        icon: '../assets/chess-icons/black/chess-pawn-black.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'F-2',
        icon: '../assets/chess-icons/black/chess-pawn-black.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'G-2',
        icon: '../assets/chess-icons/black/chess-pawn-black.svg',
        points: 1,
        piece: 'pawn'
    },
    {
        postion: 'H-2',
        icon: '../assets/chess-icons/black/chess-pawn-black.svg',
        points: 1,
        piece: 'pawn'
    },
]

function getPawnPossibleMoves(xAxisPos, yAxisPos, xAxisIndex, yAxisIndex){
    let possibleMoves = []
    console.log('xAxisPos:'+ xAxisPos, 'yAxisPos:'+ yAxisPos, 'xAxisIndex:'+ xAxisIndex, 'yAxisIndex:'+yAxisIndex)
    let forwardMoves = 1

    let yAxisIndexForCapture = null
    let canMoveForward = false

    if(player === 'light'){
        if(yAxisPos == 7){ //can't be ===, otherwise comparing int to string
            forwardMoves = 2
        }
        yAxisIndexForCapture = yAxisIndex - 1
        canMoveForward = yAxisIndex > 0

        for(let y = yAxisIndex - 1; y >= yAxisIndex - forwardMoves; y--){
            if(y<0) break
            
            let box = document.getElementById(`${xAxisPos}-${yAxis[y]}`)
            // if there's a piece in front of the pawn 
            if(box.childElementCount == 0){
                possibleMoves.push(box)
            }else{
                break
            }
        }
    }else{
        if(yAxisPos === 2){
            forwardMoves = 2
        }
        yAxisIndexForCapture = yAxisIndex + 1
        canMoveForward = yAxisIndex > 0

        for(let y = yAxisIndex + 1; y <= yAxisIndex + forwardMoves; y++){
            if(y>yAxis.length) break
            
            let box = document.getElementById(`${xAxisPos}-${yAxis[y]}`)
            // if there's a piece in front of the pawn 
            if(box.childElementCount == 0){
                possibleMoves.push(box)
            }else{
                break
            }
        }
    }

    if(canMoveForward){
        if(xAxisIndex > 0){
            let pieceToCaptureLeft = document.getElementById(`${xAxis[xAxisIndex - 1]}-${yAxis[yAxisIndexForCapture]}`)
            if(pieceToCaptureLeft.childElementCount > 0 && pieceToCaptureLeft.children[0].classList.contains(enemy)){
                possibleMoves.push(pieceToCaptureLeft)
            }
        }

        if(xAxisIndex < xAxis.length - 1){
            let pieceToCaptureRight = document.getElementById(`${xAxis[xAxisIndex + 1]}-${yAxis[yAxisIndexForCapture]}`)
            if(pieceToCaptureRight.childElementCount > 0 && pieceToCaptureRight.children[0].classList.contains(enemy)){
                possibleMoves.push(pieceToCaptureRight)
            }
        }
    }

    // TODO: check for el passant 

    return possibleMoves
}

function getRookPossibleMoves (xAxisPos, yAxisPos, xAxisIndex, yAxisIndex){
    let possibleMoves = []
    
    let topCollision = false
    let bottomCollision = false
    let rightCollision = false
    let leftCollision = false
    let xInc = 1
    let yInc = 1

    while(!(topCollision && bottomCollision && leftCollision && rightCollision)){
        if(!(topCollision && bottomCollision)){
            if(yAxisIndex + yInc < yAxis.length){
                if(!topCollision){
                    let topBlock = document.getElementById(`${xAxisPos}-${yAxis[yAxisIndex + yInc]}`)
                    if(topBlock.childElementCount > 0){
                        if(topBlock.children[0].classList.contains(enemy)){
                            possibleMoves.push(topBlock)
                        }
                        topCollision = true
                    }else{
                        possibleMoves.push(topBlock)
                    }
                }
            }else{
                topCollision = true
            }

            if(yAxisIndex > yInc - 1){
                if(!bottomCollision){
                    let bottomBlock = document.getElementById(`${xAxisPos}-${yAxis[yAxisIndex - yInc]}`)
                    if(bottomBlock.childElementCount > 0){
                        if(bottomBlock.children[0].classList.contains(enemy)){
                            possibleMoves.push(bottomBlock)
                        }
                        bottomCollision = true
                    }else{
                        possibleMoves.push(bottomBlock)
                    }
                }
            }else{
                bottomCollision = true
            }

            yInc++
        }

        if(!leftCollision || !rightCollision){
            if(xAxisIndex + xInc < xAxis.length){
                if(!rightCollision){
                    let rightBlock = document.getElementById(`${xAxis[xAxisIndex + xInc]}-${yAxisPos}`)
                    if(rightBlock.childElementCount > 0){
                        if(rightBlock.children[0].classList.contains(enemy)){
                            possibleMoves.push(rightBlock)
                        }else{
                            if(!isLeftCastlingPerformed){
                                let pieceCollideWith = rightBlock.children[0]
                                
                                if(pieceCollideWith.dataset.piece === 'king'){
                                    let myKingPosition = rightBlock.id

                                    if(player == 'light'){
                                        if(xAxisPos + '-' + yAxisPos == 'A-8' && myKingPosition === 'E-8'){
                                            possibleMoves.push(rightBlock)
                                        }
                                    }else{
                                        if(xAxisPos + '-' + yAxisPos === 'A-1' && myKingPosition === 'E-1'){
                                            possibleMoves.push(rightBlock)
                                        }  
                                    }
                                }
                            }
                        }
                        rightCollision = true
                    }else{
                        possibleMoves.push(rightBlock)
                    }
                }
            }else{
                rightCollision = true
            }
            
            if(xAxisIndex > xInc - 1){
                if(!leftCollision){
                    let leftBlock = document.getElementById(`${xAxis[xAxisIndex - xInc]}-${yAxisPos}`)
                    if(leftBlock.childElementCount > 0){
                        if(leftBlock.children[0].classList.contains(enemy)){
                            possibleMoves.push(leftBlock)
                        }else{
                            if(!isRightCastlingPerformed){
                                let pieceCollideWith = leftBlock.children[0]
                                
                                if(pieceCollideWith.dataset.piece === 'king'){
                                    let myKingPosition = leftBlock.id

                                    if(player == 'light'){
                                        if(xAxisPos + '-' + yAxisPos == 'H-8' && myKingPosition === 'E-8'){
                                            possibleMoves.push(leftBlock)
                                        }
                                    }else{
                                        if(xAxisPos + '-' + yAxisPos === 'H-1' && myKingPosition === 'E-1'){
                                            possibleMoves.push(leftBlock)
                                        }  
                                    }
                                }
                            }
                        }
                        leftCollision = true
                    }else{
                        possibleMoves.push(leftBlock)
                    }
                }
            }else{
                leftCollision = true
            }
            xInc++
        }
    console.log('topCollision:'+topCollision,
        'bottomCollision:'+bottomCollision,
        'leftCollision:'+leftCollision,
        'rightCollision:'+rightCollision)
    }
    return possibleMoves
}