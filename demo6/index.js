import { listen,timeline,styler,value,spring,stagger,tween,action} from 'popmotion';
import _ from 'underscore-es'
import scroll from 'stylefire/scroll';
const waveString = document.querySelector('h1')
const waveArray = Array.from(waveString.children).map(styler)
let playing = false
const waveHandle = (e)=>{
  stagger([
    ...waveArray.map((el,index)=>{
       return spring({
        from:{x:0,y:100},
        to: { x: 0, y: 0 },
        velocity: value({x:0,y:0},el.set).getVelocity(),
        stiffness: 1000,
        mass: 2,
        damping:10
      })
    })
  ],200)
  .start({
    complete:()=>{
      console.log('wave complete'),
      playing = false
    },
    error:()=>{},
    update:(values) =>values.forEach((v,i)=>{
      value({x:0,y:0},waveArray[i].set({x:v.x,y:v.y/((i+2)*0.5)}))
    })
  })

}
listen(document,'scroll',false)
  .filter((e)=> (waveString.getBoundingClientRect().top < window.innerHeight && waveString.getBoundingClientRect().bottom>0))
  // .start(waveHandle)
  .start({
    complete:() => console.log('scroll complete'),
    error:() =>console.log('scroll error'),
    update: (v) =>{
      if(playing) return
       waveHandle(v)
       playing = true
    }
  })
