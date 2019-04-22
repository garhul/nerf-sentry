var regGP;
var hasGP = false;

function canGame() { //Function is can use cont
  return "getGamepads" in navigator;
}

function useGamepad() {
  var gp = navigator.getGamepads()[0];
  console.log (gp);
  return
  $("#menutest > .title").html("<span class=\"info\">Gamepad name:</span> " + gp.id);
  if (gp.buttons[0].pressed) {
    $(".button span.pressed").html("A Button");
  }
  if (gp.buttons[1].pressed) {
    $(".button span.pressed").html("B Button");
  }
  if (gp.buttons[2].pressed) {
    $(".button span.pressed").html("X Button");
  }
  if (gp.buttons[3].pressed) {
    $(".button span.pressed").html("Y Button");
  }
  if (gp.buttons[4].pressed) {
    $(".button span.pressed").html("Left Bumper");
  }
  if (gp.buttons[5].pressed) {
    $(".button span.pressed").html("Right Bumper");
  }
  if (gp.buttons[6].pressed) {
    $(".button span.pressed").html("Left Trigger");
  }
  if (gp.buttons[7].pressed) {
    $(".button span.pressed").html("Right Trigger");
  }
  if (gp.buttons[8].pressed) {
    $(".button span.pressed").html("Select");
  }
  if (gp.buttons[9].pressed) {
    $(".button span.pressed").html("Start");
  }
  if (gp.buttons[10].pressed) {
    $(".button span.pressed").html("Left Stick Down");
  }
  if (gp.buttons[11].pressed) {
    $(".button span.pressed").html("Right Stick Down");
  }
  if (gp.buttons[12].pressed) {
    $(".button span.pressed").html("D-Pad Up");
  }
  if (gp.buttons[13].pressed) {
    $(".button span.pressed").html("D-Pad Down");
  }
  if (gp.buttons[14].pressed) {
    $(".button span.pressed").html("D-Pad Left");
  }
  if (gp.buttons[15].pressed) {
    $(".button span.pressed").html("D-Pad Right");
  }
  // ****************************************
  // Left
  // ****************************************
  $(".left-stick .x").html(gp.axes[0]);
  $(".left-stick .y").html(gp.axes[1]);
  if (gp.axes[0] < -0.3) {
    $(".left-stick .dir").html("Left");
  } else if (gp.axes[0] > 0.3) {
    $(".left-stick .dir").html("Right");
  } else if (gp.axes[1] < -0.3) {
    $(".left-stick .dir").html("Up");
  } else if (gp.axes[1] > 0.3) {
    $(".left-stick .dir").html("Down");
  } else {
    $(".left-stick .dir").html("Centered-ish");
  }
  // ****************************************
  // Right
  // ****************************************
  $(".right-stick .x").html(gp.axes[2]);
  $(".right-stick .y").html(gp.axes[3]);
  if (gp.axes[2] < -0.3) {
    $(".right-stick .dir").html("Left");
  } else if (gp.axes[2] > 0.3) {
    $(".right-stick .dir").html("Right");
  } else if (gp.axes[3] < -0.3) {
    $(".right-stick .dir").html("Up");
  } else if (gp.axes[3] > 0.3) {
    $(".right-stick .dir").html("Down");
  } else {
    $(".right-stick .dir").html("Centered-ish");
  }
}
var ws = null;
function startWs() {
  ws = new WebSocket('ws://192.168.0.108:5000');
  ws.binaryType = 'arraybuffer';
  ws.addEventListener('message', function (event) {
      console.log('Message from server', event.data);
  });
}

startWs();

var in_use = false;
function send(payload) {
  if (in_use) return;
  in_use = true;

  if (ws.readyState === ws.OPEN) {
    ws.send(payload);
        console.log(payload);
  } else {
    console.error('unable to communicate with socket');
  }
  setTimeout(function () {
    in_use = false;
  }, 100);
}

$(document).ready(function() {
  if (canGame()) { //Yo, we can game.
    var prev = null
    $(window).on("gamepadconnected", function() { //Seems we've detected a gamepad
      repGP = window.setInterval(() => {
        const gamepad = navigator.getGamepads()[0];
        const data = new Uint8Array(6);
        data[0] = Math.ceil(gamepad.axes[0] * 100) + 100;
        data[1] = Math.ceil(gamepad.axes[1] * 100) + 100;
        data[2] = Math.ceil(gamepad.buttons[6].value * 100);
        data[3] = Math.ceil(gamepad.buttons[7].value * 100);
        data[4] = Math.ceil(gamepad.buttons[8].value * 100);
        data[5] = Math.ceil(gamepad.buttons[9].value * 100);

        if (data.toString() !== prev) {
          send(data);
        }

        prev = data.toString();
      }, 100);
      //Start gamepad events
      console.log("connection event");
      var hasGP = true;
    });

    $(window).on("gamepaddisconnected", function() {
      console.log("disconnection event");
      window.clearInterval(repGP);
    });
    //setup an interval for Chrome
    var checkGP = window.setInterval(function() {
      console.log('checkGP');
      if (navigator.getGamepads()[0]) {
        if (!hasGP) $(window).trigger("gamepadconnected");
        window.clearInterval(checkGP);
      }
    }, 100);
  }
});
