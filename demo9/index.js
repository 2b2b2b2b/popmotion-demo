import {keyframes, styler, easing, tween ,svg ,chain,timeline,delay} from 'popmotion';
const icon = document.querySelector('.icon-wapper')
const topLine = document.querySelector('.top')
const bottomLine = document.querySelector('.bottom')
const middle = document.querySelector('.middle')
const path = document.querySelector('path')
const topStyler = styler(topLine)
const bottomStyler = styler(bottomLine)
const middleStyler = styler(middle)
const svgStyler = svg(path)
console.log(svgStyler)
const topMove = keyframes({
    values: [
        {
            left: 0,
            top: 0,
            rotate: 0
        }, {
            left: 0,
            top: 0,
            rotate: 15
        }, {
            left: -5,
            top: 0,
            rotate: -60
        }, {
            left: -5,
            top: 1,
            rotate: -45
        }
    ],
    duration: 600,
    easing: easing.linear
}).start(v => {
    topStyler.set({left: v.left, top: v.top, rotate: v.rotate, transformOrigin: '34px 2px'})
})

const bottomMove = keyframes({
    values: [
        {
            left: 0,
            rotate: 0
        }, {
            left: 0,
            rotate: -15
        }, {
            left: -5,
            rotate: 60
        }, {
            left: -5,
            rotate: 45
        }
    ],
    duration: 600,
    easing: easing.linear
}).start(v => {
    bottomStyler.set({left: v.left, top: v.top, rotate: v.rotate, transformOrigin: '34px 2px'})
})

const ringMove = timeline([
  {track:'middle',from:{left: 0,width: 36},to:{left: -6,width: 42},duration: 200,ease:easing.linear},

  {track:'middle',to:{left: 50,width: 0},duration: 200,ease:easing.linear},

  {track:'middle',to:{left: 40,width: 0},duration: 200,ease:easing.easeOut},
  '-250',
  {track:'circle',from:0,to:100,duration:300,ease:easing.easeIn}
]).start(v=>{
  middleStyler.set({
    left:v.middle.left,
    width:v.middle.width
  })
    svgStyler.set('pathLength', v.circle)
})

icon.addEventListener('click',()=>{
  topMove.pause()
  topMove.reverse()
  topMove.resume()
  bottomMove.pause()
  bottomMove.reverse()
  bottomMove.resume()
  ringMove.pause()
  ringMove.reverse()
  ringMove.resume()
})
