import {listen, value, styler,spring,transform} from 'popmotion'
const { blendColor, interpolate, pipe } = transform;
const input = document.querySelector('input')
const counter = document.querySelector('label')
const charLimit = parseInt(input.getAttribute('maxlength'));
const counterStyler = styler(counter);
const counterScale = value(1, counterStyler.set('scale'));
const convertCharCountToColor = pipe(
  // Map character count to a 0-1 range
  interpolate([charLimit * 0.5, charLimit], [0, 1]),
  (v)=>{
    console.log(v) 
    return v
  },
  // Use that number to blend grey and red
  blendColor(counterStyler.get('color'), '#f00')
);

function updateRemainingCharsCounter(val) {
  const charCount = val.length;

  // Set remaining chars
  counter.innerHTML = charLimit - charCount;

  // Set counter color
  counterStyler.set('color', convertCharCountToColor(charCount));
}
function fireSpring() {
  spring({
    // Start the animation from the current scale:
    from: counterScale.get(),

    // We want the spring to rest on 1
    to: 1,

    // We set the initial velocity to whichever the smallest is:
    // a) counterScale's current velocity, or
    // b) an arbitrary minimum. You can experiment.
    velocity: Math.max(counterScale.getVelocity(), 100),

    // This ratio of stiffness to damping gives a nice, tight spring. Experiment!
    stiffness: 700,
    damping: 180
  }).start(counterScale);
}
listen(input, 'keydown')
  .pipe(e => e.target.value)
  .start(updateRemainingCharsCounter);

listen(input, 'keydown')
  .filter(e => e.target.value.length === charLimit)
  .start(fireSpring);
