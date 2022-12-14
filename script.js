// ==UserScript==
// @name        Infinite Page Scroll
// @description Scroll the page by holding the 'G' key and dragging your mouse! Change the speed by scrolling the mouse wheel. Done scrolling? Release the 'G' key!
// @license     Creative Commons Zero v1.0 Universal
// @supportURL  https://github.com/q2p/InfinitePageScroll
// @author      q2p
// @namespace   q2p
// @version     1.0
// @match       *://*/*
// @grant       none
// @run-at      document-start
// @noframes
// ==/UserScript==

'use strict';
(function () {
  const LOCK_KEY = "KeyG"; // <-- Edit this if you want to change the binding key
  const ACCELERATION_MULT = 0.005;
  const TIMEOUT_MS = 50;
  let speed_exponent = 2;
  let speed = 2 ** speed_exponent;
  let wanna_lock = false;
  let timeout_id = undefined;
  function is_locked() {
    return document.pointerLockElement === document.body;
  }
  function applicable(e) {
    const applicable = e.code == LOCK_KEY
      && e.target?.tagName !== "INPUT"
      && !e.target?.isContentEditable
      && !document.activeElement?.isContentEditable;
    if (applicable) {
      try {
        e.cancelBubble = true;
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
      } catch (e) { }
    }
    return applicable;
  }
  function dequeue_timeout() {
    if (timeout_id) {
      try {
        clearTimeout(timeout_id);
      } catch (e) { }
      timeout_id = undefined;
    }
  }
  function requeue_timeout() {
    if (timeout_id) {
      try {
        clearTimeout(timeout_id);
      } catch (e) { }
    }
    timeout_id = setTimeout(dequeue_timeout, TIMEOUT_MS);
  }
  addEventListener("wheel", function (e) {
    if (wanna_lock && !timeout_id && is_locked()) {
      speed_exponent = Math.max(-2, Math.min(4, speed_exponent - e.deltaY * ACCELERATION_MULT));
      speed = 2 ** speed_exponent;
      try {
        e.preventDefault();
      } catch (e) { }
    }
  }, { passive: false });
  addEventListener("mousemove", function (e) {
    if (wanna_lock && !timeout_id && is_locked()) {
      scroll(scrollX + e.movementX * speed, scrollY + e.movementY * speed);
    }
  });
  addEventListener("keydown", function (e) {
    if (!applicable(e) || wanna_lock) {
      return;
    }
    wanna_lock = true;
    requeue_timeout();
    try {
      document.body.requestPointerLock();
    } catch (e) { }
  }, { passive: false });
  addEventListener("keyup", function (e) {
    if (!applicable(e) || !wanna_lock) {
      return;
    }
    wanna_lock = false;
    requeue_timeout();
    try {
      document.exitPointerLock();
    } catch (e) { }
  }, { passive: false });
  addEventListener("load", function () {
    addEventListener("pointerlockchange", requeue_timeout);
  });
})();
