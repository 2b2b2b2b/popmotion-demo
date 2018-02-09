import {tween} from 'popmotion'
// let btn = document.querySelector('button')
// console.log(btn)
// window.a = tween({
//   // elapsed:1
// }).start(console.log)
// btn.addEventListener('click',()=>{
//   // console.log(a.getProgress())
//   // a.seek(1)
//   a.pause()
//   console.log('pasue')
//   a.reverse().resume()
//
// })
tween({
  from: { x: 0, scale: 1,y:0},
  to: { x: 300, scale: 2,y:100 },
}).start(console.log) 
