import { listen ,pointer,styler} from 'popmotion';
const ball = document.querySelector('.ball');
const ballStyler = styler(ball);
let pointerTracker;

const startTracking = () => {
	pointerTracker = pointer({
    x: ballStyler.get('x'),
		y: ballStyler.get('y')
  })
		.start(ballStyler.set);
};

const stopTracking = () => {
	if (pointerTracker) pointerTracker.stop();
};

listen(ball, 'mousedown touchstart').start(startTracking);
listen(document, 'mouseup touchend').start(stopTracking);
