//jshint esversion:6
const io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:8000");

$(document).ready(function () {
    const game = Runner.instance_;

    (function tick() {
        /* do not do anything if the game is not running */
        if (game.crashed || game.paused) {
            return requestAnimationFrame(tick);
        }
        const obstacles = game.horizon.obstacles;
        if (obstacles.length) {
            const tRex = game.tRex;
            const tRexWidth = tRex.config.WIDTH;
            const obstacle = obstacles[0];
            const obstacleWidth = obstacles[0].width;
            const obstacleHeight = obstacles[0].typeConfig.height;
            const gravity = game.config.GRAVITY;
            const safety = 2 * game.currentSpeed;
            const jumpHeight = obstacleHeight + safety;
            const jumpVelocityY = Math.sqrt(2 * gravity * jumpHeight);
            const jumpAngle = (60 * Math.PI) / 180;
            const jumpVelocity = jumpVelocityY / Math.sin(jumpAngle);
            const jumpDistance =
                safety +
                (Math.pow(jumpVelocity, 2) * Math.sin(2 * jumpAngle)) / gravity;
            if (
                obstacle.xPos - tRex.xPos - tRexWidth <=
                0.9 * (jumpDistance - obstacleWidth)
            ) {
                if (obstacle.yPos > 75) {
                    if (!tRex.jumping) {
                        jump();
                        tRex.jumpVelocity = -jumpVelocityY;
                    }
                } else if (obstacle.yPos === 75) {
                    if (!tRex.ducking) {
                        duck();
                    }
                }
            }
        }

        requestAnimationFrame(tick);
    })();

    const dispatchKeyEvent = function (eventName, keyCode) {
        var e = new Event(eventName);
        e.keyCode = keyCode;
        document.dispatchEvent(e);
    };
    const simulateKeyPress = function (keyCode) {
        dispatchKeyEvent("keydown", keyCode);
        setTimeout(function () {
            dispatchKeyEvent("keyup", keyCode);
        }, 300);
    };
    const jump = function () {
        simulateKeyPress(65); // keyCode for the Arrow Up key is 38
        ioClient.emit("Move", "Jump");
    };
    const duck = function () {
        simulateKeyPress(65); // keyCode for the Arrow Down key is 40
        ioClient.emit("Move", "Duck");
    };

    $(document).keypress(function (e) {
        if (e.keyCode == 32) {
            console.log("Space Pressed");
        }
    });
});