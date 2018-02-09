import {decay,styler,value,pointer,listen,pipe} from 'popmotion'

const ball = document.querySelector('.ball');
const ballStyler = styler(ball);
const ballXY = value({ x: 0, y: 0 }, ballStyler.set);
function startTracking() {
	pointer(ballXY.get())
		.start(ballXY);
}

function stopTracking() {
	decay({
		from: ballXY.get(),
		velocity: ballXY.getVelocity(),
		restDelta:0.1
	}).start(ballXY);
}

listen(ball, 'mousedown touchstart').start(startTracking);
listen(document, 'mouseup touchend').start(stopTracking);
