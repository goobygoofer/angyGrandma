"use-strict"

//event.preventDefault(); put this inside event listener if issues occur

let joystick_canvas = document.getElementById("joystick-canvas");
let jCtx = joystick_canvas.getContext("2d");
let joyImage = new Image();
joyImage.src="./joy_image.png";

//joyImage.onload = function(){jCtx.drawImage(joyImage, 0,0, 304,100, 0,0, 304,100)};

var rect = joystick_canvas.getBoundingClientRect();

joystick_canvas.addEventListener('touchstart', (event) => {
	event.preventDefault();
    touching = true;
    user_touch=[event.touches[0].pageX - rect.left, event.touches[0].pageY - rect.top];
    console.log(`Touch beginning at ${event.touches[0].pageX - rect.left}, ${event.touches[0].pageY - rect.top}`)
});

joystick_canvas.addEventListener('touchmove', (event) => {
	if (last_sector !== joy_sector){
		last_sector = joy_sector;
		clearInterval(movementInterval);
		movementInterval = null;
	}
	event.preventDefault();
    user_touch=[event.touches[0].pageX - rect.left, event.touches[0].pageY - rect.top];
    //console.log(`moving to:  ${event.touches[0].pageX - rect.left}, ${event.touches[0].pageY - rect.top}`);
});

let end_touch;
joystick_canvas.addEventListener('touchend', (event) => {
	event.preventDefault();
	joy_sector="clear";
    touching=false;
    user_touch=null;
    //console.log(`Touch end: ${event}`);
    console.log("User stopped fiddling in the UI canvas...");
    end_touch = event;
	clearInterval(movementInterval);
    movementInterval = null;
});

let cancel_touch;
joystick_canvas.addEventListener('touchcancel', (event) => {
	event.preventDefault();
    touching=false;
    user_touch=null;
    //console.log(`Touch end: ${event}`);
    cancel_touch = event;
	clearInterval(movementInterval);
    movementInterval = null;
});

let touching = false;
let user_touch = null;
let joy_sector = 'up';
let last_sector = joy_sector;//you already know

function getSlice(x, y) {
    // Find the equation of the circle
    const r = 50;
    const circle_eq = ((x - 50)**2 + (50 - y)**2) / r**2;
  
    // Find which slice the coordinate belongs to
    const angle = Math.atan2(y - 50, x - 50);
    const angle_degrees = (angle * 180) / Math.PI;
  
    if ((angle_degrees >= -135 && angle_degrees < -45) || (angle_degrees >= 225 && angle_degrees < 315)) {
      //up button
      if (y < 50 && circle_eq <= 1) {
		movePlayer('up', true);
		joy_sector = 'up';
        return "UP";
      }
    } else if ((angle_degrees >= -45 && angle_degrees < 45) || (angle_degrees >= 315 || angle_degrees < -315)) {
      //right button
      if (x > 50 && circle_eq <= 1) {
		movePlayer('right', true);
		joy_sector = 'right';
        return "RIGHT";
      }
    } else if ((angle_degrees >= 45 && angle_degrees < 135) || (angle_degrees >= -315 && angle_degrees < -225)) {
      //down button
      if (y > 50 && circle_eq <= 1) {
		movePlayer('down', true);
		joy_sector = 'down';
        return "DOWN";
      }
    } else if ((angle_degrees >= -225 && angle_degrees < -135) || (angle_degrees >= 135 && angle_degrees < 225)) {
      //left button
      if (x < 50 && circle_eq <= 1) {
		movePlayer('left', true);
		joy_sector = 'left';
        return "LEFT";
      }
    }
  
    return null; // The coordinate is not within the circle
}
//joy_dirs[joy_sector]
let joy_dirs = {
	"clear":[0,0],
	"up":[98,0],
	"right":[196,0],
	"down":[294,0],
	"left":[392,0]
}

function updateUI(){
    jCtx.clearRect(0,0,300,100);
	jCtx.fillStyle="white";
	jCtx.fillText("Action", 200, 50);
    if (touching && user_touch && user_touch[0] > 0 && user_touch[0] < 300 && user_touch[1] > 0 && user_touch[1] < 100){
        //console.log("User is fiddling in the UI canvas...");
        jCtx.drawImage(joyImage, joy_dirs[joy_sector][0], joy_dirs[joy_sector][1], 98,100, 0,0, 100,100);
        //but *where* on the canvas
        if (user_touch[0] > 0 && user_touch[0] < 150){//left side
            //console.log("on the left side...");
            //but *where* on the left side
            let which = getSlice(Math.floor(user_touch[0]),Math.floor(user_touch[1]));
            console.log(`Currently firing ${which} button!`);
        } else {//right side
            //console.log("on the right side...");
			player.equip();
            jCtx.fillStyle="rgb(255,0,0,0.2)";
            jCtx.fillRect(150,0, 300,100);
        }
    } else {
		jCtx.drawImage(joyImage, 0,0, 98,100, 0,0, 100,100);
	}
}

var run = setInterval(() => {
    updateUI();
},100);