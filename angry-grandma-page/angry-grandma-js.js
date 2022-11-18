//game display attributes (1 square is 25x25px)
gameDisplay = function(){
    this.blockSize = 25;
    this.rows = 20;
    this.cols = 15;
    this.board = document.getElementById("board");
    this.scoreBoard = document.getElementById("score")//score display this
    this.board.height = this.rows * this.blockSize;
    this.board.width = this.cols * this.blockSize;
    this.context = this.board.getContext("2d"); //used for drawing on the board
    this.startScreen = new Image()//background
    this.startScreen.src = "background2.png"
    this.walls = []
    for (i=1; i<this.board.height/this.blockSize; i++){
        this.walls.push([-1*this.blockSize,i*this.blockSize])
        this.walls.push([this.board.width,i*this.blockSize])//sides(but probably two blocks overlapping on corners)
    }
}
let display = new gameDisplay()

//falling things shadow
shadowImg = new Image()
shadowImg.src = "shadow.png"
//falling pots
var potSmashSound = new Audio("smash.mp3")
var potCatchSound = new Audio("catch.mp3")
debrisList = []
debrisImage = new Image()
debrisImage.src = "potPic.png"
let debrisFall = function(){
    debrisX = Math.floor(Math.random()*(display.cols))*display.blockSize
    debrisY = 0
    tempList = []
    for (i=0; i<display.board.height/display.blockSize; i++){
        debrisY+=1*display.blockSize
        debrisList.push([debrisX, debrisY])
        tempList.push([debrisX, debrisY])
    }
}
//falling/exploding molotovs
var molotovSound = new Audio("molotovBoom.mp3")
molotovList = []
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
    molotovX = Math.floor(Math.random()*(display.cols))*display.blockSize
    molotovY = 0
    for (i=0; i<display.board.height/display.blockSize; i++){
        molotovY+=1*display.blockSize
        molotovList.push([molotovX, molotovY])
    }
}
let molotovExplode = function(x){
    for (i=0;i<5;i++){
        explodeCoords.push(x-display.blockSize)
    }
}
//smashed pot
smashedPotImage = new Image()
smashedPotImage.src = "smashedPot.png"
brokenList = []//pots that have hit the ground
//beer bonus
beerSound = new Audio("drink.mp3")
beerImage = new Image()
beerImage.src = "beer.png"
beerList = []
let beerFall = function(){
    beerX = Math.floor(Math.random()*(display.cols))*display.blockSize
    beerY = 0
    for (i=0; i<display.board.height/display.blockSize; i++){
        beerY+=1*display.blockSize
        beerList.push([beerX, beerY])
    }
}
//grandma sprites
chewingSound=new Audio("chewing.mp3")
growlingSound = new Audio("growling.mp3")
grandmaSpritesheet = new Image()
grandmaSpritesheet.src = "grandmaSpritesheet.png"
grandmaThrowImage = new Image()
grandmaThrowImage.src = "grandmaThrow.png"
grandmaMain = [0,225]
grandmaRageFrames = []
for (i=0;i<3;i++){
    grandmaRageFrames.push([0,i*75])
}
grandmaFallFrames = []
gogoGrandma = function(){
    tempFrames = []
    for (i=0;i<display.board.height/display.blockSize;i++){
        tempFrames.push([player.xCoord-display.blockSize,i*display.blockSize])//player xCoord, y descending
    }
    for (frame in tempFrames){
       if (frame%2==0){
            grandmaFallFrames.push(tempFrames[frame])}}}
grandmaThrowFrames = [0,25]
grandmaThrow = function(x){
    display.context.drawImage(//draw/push/shift should be a fxn
        grandmaThrowImage, 0, 0,
        75, 75, x, 25, 50, 25)    
}
//evil bible and jesus
Bible = function(){//add coords to player.tempCollide list when hits ground, acts as obstacle
    this.bibleImg = new Image()
    this.bibleImg.src = "bible.png"
    this.leftFace = [[225,0],[150,0]]//[0]=falling, [1]=crushed(hit ground)
    this.rightFace = [[0,0],[75,0]]//[0]=falling, [1]=crushed(hit ground)
    this.facing = this.rightFace
    this.flashImg = new Image()
    this.flashImg.src = "jesusLight.png"
    this.flashRight = [0,0]//flash is 300x300
    this.flashLeft = [300,0]
    this.flashDir = this.flashRight
    this.xCoord = 0
    this.yCoord = 0
    this.leftOffset = 0
    this.deployed=false
    this.timerSet = false
    this.counter = 20//10 frames of jesus flashing us
    this.hitGround=false
    this.flashing=false
    this.strobe=300
    this.timer = function(){
        let randomTime = Math.floor(Math.random()*12000)//random number between 10000ms and 30000ms
        //console.log("timer set")
        tempTime = setTimeout(bible.deploy,randomTime)//set ms to randomTime
    }
    this.setTrue = function(){
        this.flashing=true
    }
    this.update = function(){
        if (this.timerSet==false){
            this.timerSet = true
            bible.timer()
        }
        if (this.deployed==true){
            //console.log("deployed")
            if (this.yCoord<display.board.height-(display.blockSize*2)){
                //falling
                this.yCoord+=display.blockSize
            }
            else {
                //hit ground, fallFrames=[], draw crushed bible and strobe flash for 3 seconds(?), delay strobe start?
                //counter
                //flashTime = setTimeout(bible.setTrue,100)
                if (this.hitGround==false){
                    bible.facing.push(bible.facing[0])
                    bible.facing.shift()
                    this.hitGround=true
                }
                bible.setTrue()
                if (this.counter > 0){
                    this.counter-=1
                } else {
                    this.counter = 20
                    this.deployed=false
                    this.yCoord=0
                    this.flashing=false
                    bible.facing.push(bible.facing[0])
                    bible.facing.shift()
                    this.hitGround=false
                    bible.timer()
                    return
                }
            }
            if (this.flashing==true){
                //console.log("flash")
                display.context.drawImage(
                    this.flashImg, this.flashDir[0], 0,
                    300,300, this.xCoord-bible.leftOffset,this.yCoord-275, this.strobe, this.strobe//offset draw coord (x&y)
                )
                if (this.strobe==300){
                    this.strobe=0
                }
                else if (this.strobe==0){
                    this.strobe=300
                }
            }
            //console.log("bible")
            display.context.drawImage(
                this.bibleImg, this.facing[0][0], 0,
                75, 75, this.xCoord-display.blockSize, this.yCoord-display.blockSize, 75, 75
            )
        }
    }
    this.deploy = function(){//set up randomized bible fall
        //console.log("deploy fxn")
        bible.xCoord = Math.floor(Math.random()*(display.cols))*display.blockSize//random # between 0 and display.board.width
        this.yCoord = 0//iterate * display.board.blockSize
        //pick left or right facing
        let direction = Math.floor(Math.random()*2)
        console.log(direction)
        if (direction==0){
            //left
            bible.leftOffset = 275
            bible.facing = bible.leftFace
            bible.flashDir = bible.flashLeft
        }
        else if (direction==1){
            //right
            bible.leftOffset = 0
            bible.facing = bible.rightFace
            bible.flashDir = bible.flashRight
        }
        bible.deployed = true
    }
}
//bible= new Bible()
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
        display.context.drawImage(//input params: xcoord on canvas, ycoord on canvas
            this.cowImage,
            this.frameList[0],//start image grab from x
            0,//start image grab from y
            75,//image width
            75,//image height
            (display.board.width/2)+75,//xcoord on canvas
            display.board.height-115,//ycoord on canvas
            75,//scalable display on canvas x
            75//scalable display on canvas y
        )
        this.frameList.push(this.frameList[0])
        this.frameList.shift()
    }
}
cow = new Cow()
//player
Player = function(){
    this.score = 0
    this.missed = 0
    this.xCoord = 7 * display.blockSize
    this.yCoord = 18 * display.blockSize
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
            display.context.drawImage(this.actorRight, this.xCoord, this.yCoord)
        }
        else if (this.lastLR=="left"){
            display.context.drawImage(this.actorLeft, this.xCoord, this.yCoord)
        }
    }
    this.changeDirection = function(e=null,touched=false){
        if (touched!=true) {
            if (player.collided(e.code)==true){return}
            else if (e.code == "ArrowLeft" || e.code == "KeyA") {
                player.xCoord += -1 * display.blockSize;
                player.yCoord += 0;
            }
            else if (e.code == "ArrowRight" || e.code == "KeyD") {
                player.xCoord += 1 * display.blockSize;
                player.yCoord += 0;
            }
        }
        else if (touched==true){//here e should be "ArrowLeft" or "ArrowRight"
            if (player.collided(e)==true){return}
            else if (e == "ArrowLeft"){
                player.xCoord += -1 * display.blockSize;
                player.yCoord += 0;
            }
            else if (e == "ArrowRight"){
                player.xCoord += 1 * display.blockSize;
                player.yCoord += 0;
            }
        }
    }
    this.collided = function(direction){
        let tempX = this.xCoord
        let tempY = this.yCoord
        if (direction == "ArrowLeft" || direction == "KeyA"){
            tempX-=(1*display.blockSize)
            this.facing = "left"
        }
        if (direction == "ArrowRight" || direction == "KeyD"){
            tempX+=(1*display.blockSize)
            this.facing = "right"
        }
        if (JSON.stringify(display.walls).includes(JSON.stringify([tempX,tempY]))){
            return true//will collide
        } else {return false}//won't collide
    }
}
player = new Player()//initialize player
document.addEventListener("keydown", player.changeDirection);//usrInput
//display functions for better readability in update()
livesUpdate = function(){
    display.context.fillText("Love left", (display.board.width/2)+105, 15)
    for (i=0;i<player.lives;i++){
        display.context.drawImage(
        player.heartImage, 0, 0,
        25, 25, display.board.width/2+(i*display.blockSize)+100, display.blockSize, 25, 25)
    }
}
molotovUpdate = function(){
    if (molotovList.length != 0){//draw molotov
        if (molotovList.length>19){
            grandmaThrow(molotovList[0][0])
        }
        display.context.drawImage(//draw/push/shift should be a fxn
            molotovImage, molotovFrames[0][0], molotovFrames[0][1],
            25, 25, molotovList[0][0], molotovList[0][1], 25, 25)
        display.context.drawImage(
            shadowImg,molotovList[0][0],display.board.height-display.blockSize
        )
    }
    molotovFrames.push(molotovFrames[0])
    molotovFrames.shift()
    if (molotovList.length!=0){
        if (molotovList[0][1]==display.board.height-display.blockSize){//molotov hits ground
            molotovSound.play()
            molotovExplode(molotovList[0][0])//x coord of impact, y draw just ground lvl(should make a constant?)
            molotovList=[]
        } else {molotovList.shift()}
    }
    if (explodeCoords.length!=0){
        display.context.drawImage(//draw/push/shift should be a fxn
            explodeImage, explodeFrames[0], 0,
            75, 75, explodeCoords[0], display.board.height-80, 75, 75)
        for (i=-1;i<4;i++){
            if (explodeCoords[0]+i*display.blockSize==player.xCoord && explosionHit == false){
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
}
beerUpdate = function(){
    if (beerList.length!=0){
        if (beerList.length>19){
            grandmaThrow(beerList[0][0])
        }
        display.context.drawImage(
            beerImage, 0, 0,
            25, 25, beerList[0][0], beerList[0][1], 25, 25)
        display.context.drawImage(
            shadowImg,beerList[0][0],display.board.height-display.blockSize
        )
        if (beerList[0][0]==player.xCoord && beerList[0][1]==player.yCoord){
            //caught beer
            beerSound.play()
            beerList=[]
            player.score+=5
        } else{
            beerList.shift()
        }
    }
}
potUpdate = function(){
    if (debrisList.length != 0){//draw debris(falling pots)
        if (debrisList.length>19){
            grandmaThrow(debrisList[0][0])
        }
        display.context.drawImage(debrisImage,debrisList[0][0],debrisList[0][1])
        display.context.drawImage(
            shadowImg,debrisList[0][0],display.board.height-display.blockSize
        )
    }  
    for (broken in brokenList){//draw broken pots
        display.context.drawImage(smashedPotImage, brokenList[broken][0]-display.blockSize,display.board.height-display.blockSize)
    }
    if (debrisList.length!=0){
        if (debrisList[0][0]==player.xCoord && debrisList[0][1]==player.yCoord-display.blockSize){//player scores
            potCatchSound.play()
            player.streak+=1
            if (player.streak%10==0 && player.lives<3){
                player.lives+=1
                player.missed-=1
            }
            player.score+=1
            debrisList = []
            return
        } 
        else if (debrisList[0][1]==display.board.height){//pot hits ground
            potSmashSound.play()
            player.lives-=1
            player.missed+=1
            player.streak=0
            brokenList.push(debrisList[0])
            for (i=0;i<2;i++){
                debrisList.shift()
            }
        } else {debrisList.shift()}//else player did not score and pot did not hit ground(yet)
    }
}
growlPlayed=false
grandmaUpdate = function(){//gogoGrandma has been initiated
    if (growlPlayed!=true){
        growlingSound.play()
        growlPlayed=true
    }
    if (grandmaFallFrames.length>2){//grandma is descending upon you
        display.context.drawImage(
            grandmaSpritesheet, grandmaMain[1], grandmaMain[0], 75, 75,
            grandmaFallFrames[0][0], grandmaFallFrames[0][1], 75, 75)
        display.context.drawImage(
            shadowImg,grandmaMain[0],display.board.height-display.blockSize
        )
        grandmaFallFrames.shift()
    } else {//grandma is raging
        chewingSound.play()
        display.context.drawImage(
            grandmaSpritesheet, grandmaRageFrames[0][1], grandmaRageFrames[0][0],
            75, 75, player.xCoord-display.blockSize, player.yCoord-display.blockSize, 75, 75)
        grandmaRageFrames.push(grandmaRageFrames[0])
        grandmaRageFrames.shift()
    }
}
//main loop
going = true
Update = function() {
    display.context.clearRect(0, 0, display.board.width, display.board.height);//clear canvas
    if (player.missed < 3 && player.lives > 0){//game is going (this might be bugged)
        display.context.drawImage(display.startScreen,0,0)//draw background
        display.scoreBoard.innerHTML = "Score: " + player.score//update score
        cow.update()
        livesUpdate()
        potUpdate()
        molotovUpdate()
        beerUpdate()
        //bible.update()
        player.update()
    } else {
        //game over
        if (going == true){
            gogoGrandma()
            going = false
            document.removeEventListener("keydown", player.changeDirection)
            document.getElementById("mobileUI").removeEventListener("touchstart",touchHandler)
            document.getElementById("mobileUI").removeEventListener("touchend",endHandler)
            clearInterval(fall)
        }
        display.context.drawImage(display.startScreen,0,0)
        cow.update()
        potUpdate()
        grandmaUpdate()
        display.context.drawImage(player.loseDance[0], player.xCoord, player.yCoord)
        player.loseDance.push(player.loseDance[0])
        player.loseDance.shift()
        display.context.textAlign = 'center'
        display.context.font = "40px Courier"
        display.context.fillText("GAME OVER",display.board.width/2,150)
        display.context.font = "20px Courier"
        display.context.fillText("Grandma hates you",display.board.width/2,175)
        display.context.fillText("(refresh page to try again)",display.board.width/2,225)
    }
    //window.requestAnimationFrame(update)
}
var fall = null//had to do this to remove interval at game over
Start = function(){//start update and debrisFall intervals
    startExists=true
    document.removeEventListener("keyup",Start)
    var start = setInterval(Update, 100);
    fall = setInterval(debrisFall, 1900)
    var molotovInt = setInterval(molotovFall, 7500)
    var beerInt = setInterval(beerFall, 10000)
}
intro = function(){
    display.context.font = "12px Courier"
    display.startScreen.onload = function() {
        display.context.drawImage(display.startScreen, 0, 0)
        //display left and right button. white if unpressed, red if pressed. left arrow x=0, right arrow x=mobileUI.width-75
        display.context.fillText("Grandma ate too much Angels Trumpet!", 1, 25)
        display.context.fillText("She's throwing all her nice pots off the roof!",1,50)
        display.context.fillText("Use arrow keys (pc) or green arrows (mobile)",1,75)
        display.context.fillText("to move under the pots to catch them!",1,100)
        display.context.fillText("Catch beers for a frothy bonus!",1,125)
        display.context.fillText("Avoid grandma's cocktails of death!",1,150)
        display.context.fillText("Don't miss too many pots or Grandma will be angy...",1,175)
        display.context.fillText("Press any key to start",1,200)
        display.context.fillText("mobile users:",1,250)
        display.context.fillText("Tap left or right green arrow to start",1,275)
        var mobUIupdate = setInterval(mobileUIUpdate, 100)
        document.addEventListener("keyup", Start);
    }
}
startExists = false//all of this below is mobile browser support
winWidth = window.innerWidth//
winHeight = window.innerHeight//prob put this somewhere else
let moveInterval = null
moving = true
var whichDirection = null
//mobile controls UI
mobileArrows = new Image()
mobileArrows.src = "mobileArrowsSpritesheet.png"
mobileUI = document.getElementById("mobileUI")
mobileUI.height = 75
mobileUI.width = display.cols * display.blockSize
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

devMode = function(){
    player.lives = 1000
    player.missed=-1000
}
intro()