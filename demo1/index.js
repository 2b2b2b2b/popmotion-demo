import { tween, styler ,easing} from 'popmotion';
const ball = document.querySelector('.ball');
const ballStyler = styler(ball);
tween({
	from: { x: 0, scale: 1,y:0},
	to: { x: 300, scale: 2,y:100 },
	ease: easing.easeInOut,
	flip: Infinity,
	duration: 1000
}).start(ballStyler.set);
