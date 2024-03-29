// Javascript for index.htm

import { LittleMagicMake } from './littlemagic_make.js';

window.addEventListener('load', function () {
  const littleMagic = new LittleMagicMake();
  /**
   * Load stage and menu
   */
  const init = async function() {
    const metaData = [ 'meta/data', 'meta/sprite' ];
    await littleMagic.rest('/post',
      { 'file': metaData, 'cg': littleMagic.state['cg'], 'method': 'read/stage' }, littleMagic.setMeta);
    await littleMagic.rest('/post',
      { 'file': [ 'menu/game', `stage/${littleMagic.padZero(littleMagic.state['stage'])}` ],
        'cg': littleMagic.state['cg'], 'method': 'read/stage' }, littleMagic.setGame);
  }
  init();

  // control canvas layer
  const canvas = document.querySelector('canvas:last-child');

  // click event, right click emulates hold press
  canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    littleMagic.mouseEvent(canvas, event, true);
  });
  let [ clickTimer, clickDuration ] = [ 0, 300 ];
  canvas.addEventListener('mousedown', function(event) {
    clickTimer = new Date().getTime();
  });
  canvas.addEventListener('mouseup', function(event) {
    let pressHold = false;
    if (event.button === 0) {
      const clickReleaseTime = new Date().getTime();
      if (clickReleaseTime - clickTimer > clickDuration) {
        pressHold = true;
      }
      littleMagic.mouseEvent(canvas, event, pressHold);
    }
  });

  // tap event
  let [ touchTimer, touchDuration ] = [ null, 300 ];
  let tapLock = false;
  const touchHandler = function(event) {
    event.preventDefault();
    tapLock = true;
    let touch = event.touches[0];
    littleMagic.mouseEvent(canvas, touch, true);
  }  // touchHandler()
  const touchStart = function(event) {
    if (event.touches.length === 1)
      touchTimer = setTimeout(touchHandler, touchDuration, event);
    else
      event.preventDefault();
  }
  const touchEnd = function(event) {
    if (tapLock) {
      event.preventDefault();
      tapLock = false;
    }
    if (touchTimer)
      clearTimeout(touchTimer);
  }
  canvas.addEventListener('touchstart', touchStart);
  canvas.addEventListener('touchend', touchEnd);

  // resize event
  const resizeHandler = function() {
    littleMagic.setGameSize();
  }
  window.addEventListener('resize', resizeHandler);
});
