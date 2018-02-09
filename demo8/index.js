
  var trigger = document.querySelector('#hamburger'),
      isClosed = true;


  trigger.addEventListener('click',()=>{
    burgerTime()
  })
  function burgerTime() {
    if (isClosed == true) {
      trigger.classList.remove('is-open');
      trigger.classList.add('is-closed');
      isClosed = false;
    } else {
      trigger.classList.remove('is-closed');
      trigger.classList.add('is-open');
      isClosed = true;
    }
  }
