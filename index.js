//game display attributes (1 square is 25x25px)
var blockSize = 25;
var rows = 20;
var cols = 15;
var board;
var context; 
board = document.getElementById("board");
scoreBoard = document.getElementById("score")//score display
board.height = rows * blockSize;
board.width = cols * blockSize;
context = board.getContext("2d"); //used for drawing on the board
startScreen = new Image()//background
startScreen.src = "background.png"
let walls = []
//perimeter walls
for (i=0; i<board.width/blockSize; i++){//top/bottom
    walls.push([i*blockSize,0])
    walls.push([i*blockSize,board.height-blockSize])
}
    for (i=1; i<board.height/blockSize; i++){
        walls.push([-1*blockSize,i*blockSize])
        walls.push([board.width,i*blockSize])//sides(but probably two blocks overlapping on corners)
    }
//falling pot sprites
debrisList = []
molotovList = []
debrisImage = new Image()
debrisImage.src = "potPic.png"
molotovImage = new Image()
molotovImage.src = "molotov.png"
molotovFrames = [[0,0],[25,0]]
explodeImage = new Image()
explodeImage.src = "explosion2.png"
explodeFrames = []
explodeX = 0
explosionHit = false
for (i=0;i<5;i++){
    explodeFrames.push(i*76)
}
explodeCoords = []
let molotovFall = function(){
    molotovX = Math.floor(Math.random()*(cols))*blockSize
    molotovY = 0
    for (i=0; i<board.height/blockSize; i++){
        molotovY+=1*blockSize
        molotovList.push([molotovX, molotovY])
    }
}
let molotovExplode = function(x){
    for (i=0;i<5;i++){
        explodeCoords.push(x-blockSize)
    }
}
let debrisFall = function(){
    debrisX = Math.floor(Math.random()*(cols))*blockSize
    debrisY = 0
    tempList = []
    for (i=0; i<board.height/blockSize; i++){
        debrisY+=1*blockSize
        debrisList.push([debrisX, debrisY])
        tempList.push([debrisX, debrisY])
    }
}
//grandma sprites
grandmaSpritesheet = new Image()
grandmaSpritesheet.src = "grandmaSpritesheet.png"
grandmaMain = [0,225]
grandmaRageFrames = []
for (i=0;i<3;i++){
    grandmaRageFrames.push([0,i*75])
}
grandmaFallFrames = []
gogoGrandma = function(){
    tempFrames = []
    for (i=0;i<board.height/blockSize;i++){
        tempFrames.push([player.xCoord-blockSize,i*blockSize])//player xCoord, y descending
    }
    for (frame in tempFrames){
       if (frame%2==0){
            grandmaFallFrames.push(tempFrames[frame])}}}
//player
Player = function(){
    this.score = 0
    this.missed = 0
    this.xCoord = 7 * blockSize
    this.yCoord = 18 * blockSize
    this.lastLoc = [this.xCoord, this.yCoord]
    this.facing = "right"
    this.lastLR = "right"
    this.actorRight = new Image()
    this.actorLeft = new Image()
    this.actorRight.src = "actor1.png"
    this.actorLeft.src = "actor2.png"
    this.loseDance = [this.actorLeft,this.actorRight]
    this.lives = 3
    this.heartImage = new Image()
    this.heartImage.src = "heart.png"
    this.streak = 0
    this.update = function(){
        if (this.facing=="right"){
            this.lastLR = "right"
        }
        else if (this.facing=="left"){
            this.lastLR = "left"
        }
        if (this.lastLR=="right"){
            context.drawImage(this.actorRight, this.xCoord, this.yCoord)
        }
        else if (this.lastLR=="left"){
            context.drawImage(this.actorLeft, this.xCoord, this.yCoord)
        }
    }
    this.changeDirection = function(e=null,touched=false){
        if (touched!=true) {
            if (player.collided(e.code)==true){return}
            else if (e.code == "ArrowLeft" || e.code == "KeyA") {
                player.xCoord += -1 * blockSize;
                player.yCoord += 0;
            }
            else if (e.code == "ArrowRight" || e.code == "KeyD") {
                player.xCoord += 1 * blockSize;
                player.yCoord += 0;
            }
        }
        else if (touched==true){//here e should be "ArrowLeft" or "ArrowRight"
            if (player.collided(e)==true){return}
            else if (e == "ArrowLeft"){
                player.xCoord += -1 * blockSize;
                player.yCoord += 0;
            }
            else if (e == "ArrowRight"){
                player.xCoord += 1 * blockSize;
                player.yCoord += 0;
            }
        }
    }
    this.collided = function(direction){
        let tempX = this.xCoord
        let tempY = this.yCoord
        if (direction == "ArrowLeft" || direction == "KeyA"){
            tempX-=(1*blockSize)
            this.facing = "left"
        }
        if (direction == "ArrowRight" || direction == "KeyD"){
            tempX+=(1*blockSize)
            this.facing = "right"
        }
        if (JSON.stringify(walls).includes(JSON.stringify([tempX,tempY]))){
            return true//will collide
        } else {return false}//won't collide
    }
}
player = new Player()//initialize player
document.addEventListener("keydown", player.changeDirection);//usrInput
//cow sprite
Cow = function(){
    this.cowImage = new Image()
    this.cowImage.src = "cow.png"
    this.frameList = []
    for (i=0;i<4;i++){
        this.frameList.push(i*76)
    }
    for (i=3;i>=0;i--){
        this.frameList.push(i*76)
    }
    this.update = function(){
        //animate cow
        context.drawImage(//input params: xcoord on canvas, ycoord on canvas
            this.cowImage,
            this.frameList[0],//start image grab from x
            0,//start image grab from y
            75,//image width
            75,//image height
            (board.width/2)+75,//xcoord on canvas
            board.height-115,//ycoord on canvas
            75,//scalable display on canvas x
            75//scalable display on canvas y
        )
        this.frameList.push(this.frameList[0])
        this.frameList.shift()
    }
}
cow = new Cow()
//pot sprite
smashedPotImage = new Image()
smashedPotImage.src = "smashedPot.png"
brokenList = []//pots that have hit the ground
//main loop
going = true
update = function() {
    context.clearRect(0, 0, board.width, board.height);//clear canvas
    if (player.missed < 3 && player.lives > 0){//game is going
        context.drawImage(startScreen,0,0)//draw background
        //draw cow
        cow.update()
        //draw lives (represented by enlarged pots at upper right screen)
        context.fillText("Love left", (board.width/2)+105, 15)
        for (i=0;i<player.lives;i++){
            context.drawImage(
            player.heartImage, 0, 0,
            25, 25, board.width/2+(i*blockSize)+100, blockSize, 25, 25)
        }
        if (debrisList.length != 0){//draw debris(falling pots)
            context.drawImage(debrisImage,debrisList[0][0],debrisList[0][1])
        }
        if (molotovList.length != 0){//draw molotov
            context.drawImage(//draw/push/shift should be a fxn
                molotovImage, molotovFrames[0][0], molotovFrames[0][1],
                25, 25, molotovList[0][0], molotovList[0][1], 25, 25)
        }
        molotovFrames.push(molotovFrames[0])
        molotovFrames.shift()
        for (broken in brokenList){//draw broken pots
            context.drawImage(smashedPotImage, brokenList[broken][0]-blockSize,board.height-blockSize)
        }
        player.update()//draw/update player
        if (debrisList.length!=0){//do this for molotovList
            if (debrisList[0][0]==player.xCoord && debrisList[0][1]==player.yCoord-blockSize){//player scores
                player.streak+=1
                if (player.streak%10==0 && player.lives<3){
                    player.lives+=1
                    player.missed-=1
                }
                player.score+=1
                scoreBoard.innerHTML = "Score: " + player.score
                debrisList = []
                return
            } 
            else if (debrisList[0][1]==board.height){//pot hits ground
                player.lives-=1
                player.missed+=1
                player.streak=0
                brokenList.push(debrisList[0])
                for (i=0;i<2;i++){
                    debrisList.shift()
                }
            } else {debrisList.shift()}//else player did not score and pot did not hit ground(yet)
            //molotov
        }
        if (molotovList.length!=0){
            if (molotovList[0][1]==board.height-blockSize){//molotov hits ground
                molotovExplode(molotovList[0][0])//x coord of impact, y draw just ground lvl(should make a constant?)
                molotovList=[]
            } else {molotovList.shift()}
        }
        if (explodeCoords.length!=0){
            context.drawImage(//draw/push/shift should be a fxn
                explodeImage, explodeFrames[0], 0,
                75, 75, explodeCoords[0], board.height-80, 75, 75)
            for (i=-1;i<4;i++){
                if (explodeCoords[0]+i*blockSize==player.xCoord && explosionHit == false){
                    player.lives -= 1
                    explosionHit=true
                    break
                }
            }
            if (explodeCoords.length!=0){
                explodeCoords.shift()
                explodeFrames.push(explodeFrames[0])
                explodeFrames.shift()
            }
        }
        else if (explodeCoords.length==0){
            explosionHit=false
        }
    } else {
        //game over
        if (going == true){
            gogoGrandma()
            going = false
        }
        document.removeEventListener("keydown", player.changeDirection)
        document.getElementById("mobileUI").removeEventListener("touchstart",touchHandler)
        document.getElementById("mobileUI").removeEventListener("touchend",endHandler)
        context.drawImage(startScreen,0,0)
        cow.update()
        for (broken in brokenList){
            context.drawImage(smashedPotImage, brokenList[broken][0]-blockSize,board.height-blockSize)
        }
        if (grandmaFallFrames.length>2){//grandma is descending upon you
            context.drawImage(//might can be same as draw/push/shift fxn
                grandmaSpritesheet, grandmaMain[1], grandmaMain[0], 75, 75,
                grandmaFallFrames[0][0], grandmaFallFrames[0][1], 75, 75)
            grandmaFallFrames.shift()
        } else {//grandma is raging
            context.drawImage(//draw/push/shift should be a fxn
                grandmaSpritesheet, grandmaRageFrames[0][1], grandmaRageFrames[0][0],
                75, 75, player.xCoord-blockSize, player.yCoord-blockSize, 75, 75)
            grandmaRageFrames.push(grandmaRageFrames[0])
            grandmaRageFrames.shift()
        }
        context.drawImage(player.loseDance[0], player.xCoord, player.yCoord)
        player.loseDance.push(player.loseDance[0])
        player.loseDance.shift()
        context.textAlign = 'center'
        context.font = "40px Courier"
        context.fillText("GAME OVER",board.width/2,150)
        context.font = "20px Courier"
        context.fillText("Grandma hates you",board.width/2,175)
        context.fillText("(refresh page to try again)",board.width/2,225)
    }
}
Start = function(){//start update and debrisFall intervals
    startExists=true
    document.removeEventListener("keyup",Start)
    var start = setInterval(update, 100);
    var fall = setInterval(debrisFall, 1900)
    var molotovInt = setInterval(molotovFall, 7500)
}
intro = function(){
    context.font = "12px Courier"
    startScreen.onload = function() {
        context.drawImage(startScreen, 0, 0)
        //display left and right button. white if unpressed, red if pressed. left arrow x=0, right arrow x=mobileUI.width-75
        context.fillText("Grandma ate too much Angels Trumpet!", 1, 25)
        context.fillText("She's throwing all her nice pots off the roof!",1,50)
        context.fillText("Use arrow keys (pc) or green arrows (mobile)",1,75)
        context.fillText("to move under the pots to catch them!",1,100)
        context.fillText("Avoid grandma's cocktails of death!",1,125)
        context.fillText("Don't miss too many pots or Grandma will be angy...",1,150)
        context.fillText("Press any key to start",1,175)
        context.fillText("mobile users:",1,225)
        context.fillText("Tap left or right green arrow to start",1,250)
        var mobUIupdate = setInterval(mobileUIUpdate, 100)
        document.addEventListener("keyup", Start);
    }
}
startExists = false//all of this below is mobile browser support
winWidth = window.innerWidth//
winHeight = window.innerHeight//
let moveInterval = null
moving = true
var whichDirection = null
//mobile controls UI
mobileArrows = new Image()
mobileArrows.src = "mobileArrowsSpritesheet.png"
mobileUI = document.getElementById("mobileUI")
mobileUI.height = 75
mobileUI.width = cols * blockSize
mobileUIContext = mobileUI.getContext("2d")

let leftArrowPos = [0,0]
let rightArrowPos = [mobileUI.width-75,0]

mobileUIUpdate = function(){
    mobileUIContext.clearRect(0, 0, mobileUI.width, mobileUI.height);//clear canvas
    //display left and right button. white if unpressed, red if pressed. left arrow x=0, right arrow x=mobileUI.width-75
    mobileUIContext.drawImage(
        mobileArrows, 0, 0, 75, 75,
        leftArrowPos[0], leftArrowPos[1], 75, 75)
    mobileUIContext.drawImage(
        mobileArrows, 152, 0, 75, 75,
        rightArrowPos[0], rightArrowPos[1], 75, 75)
    if (moving == true){
        if (whichDirection == "ArrowLeft"){
            //display left arrow pressed(red)
            mobileUIContext.drawImage(
            mobileArrows, 76, 0, 75, 75,
            leftArrowPos[0], leftArrowPos[1], 75, 75)
        }
        else if (whichDirection == "ArrowRight"){
            //display right arrow pressed(red)
            mobileUIContext.drawImage(
            mobileArrows, 228, 0, 75, 75,
            rightArrowPos[0], rightArrowPos[1], 75, 75)
        }
    }
}
touchHandler = function(e) {
    e.preventDefault()
    if (startExists==false){Start()}
    touchX = e.touches[0].screenX
    whichDirection = null
    if (touchX>Math.floor(winWidth/2)){
        whichDirection = "ArrowRight"
    }
    else if (touchX<Math.floor(winWidth/2)){
        whichDirection = "ArrowLeft"
    }
    player.changeDirection(whichDirection,true)
    if (moving == false){
        moving = true
        setTimeout(moveInterval=setInterval(function(){player.changeDirection(whichDirection,true)},100), 1000)
    }
}
endHandler = function(e){
    moving = false
    clearInterval(moveInterval)
}
document.getElementById("mobileUI").addEventListener("touchstart",touchHandler, false)
document.getElementById("mobileUI").addEventListener("touchend", endHandler, false)
intro()