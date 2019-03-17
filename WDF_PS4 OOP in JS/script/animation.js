const $canvas = $('#game')[0];
const canvasContext = $canvas.getContext('2d');
const spriteSize = 200;

let currentAction;
let moveDirection = -1;
let pokemonAnimation1;
let pokemonAnimation2;

let animations = [];

class Animation {
    constructor(rate) {
        this.lastTime = 0;
        this.rate = rate;
        this.active = true;
    }

    update() {
    };

    render() {
    };

    run(time) {
        if ((time - this.lastTime) > this.rate) {
            this.lastTime = time;
            this.update();
        }
        this.render();
    }
}

function mainLoop(time) {
    animations = animations.filter(el => el.active);

    animations.forEach((el) => {
        el.run(time);
    });

    if (pokemonAnimation1.dx === 0 && pokemonAnimation2.dx === 0
        && animations.indexOf(pokemonAnimation1) !== -1 && animations.indexOf(pokemonAnimation2) !== -1) {
        if (actions.length > 0) {
            currentAction = actions.pop();
            if (pokemonAnimation1.player.name === currentAction.name) {
                pokemonAnimation2.dx = 10;
            } else {
                pokemonAnimation1.dx = 10;
            }
        } else {
            let boom;
            if (pokemonAnimation1.player.health <= 0) {
                boom = createBoomAnimation(pokemonAnimation1.xp, pokemonAnimation1.yp);
                pokemonAnimation1.active = false;

            } else {
                boom = createBoomAnimation(pokemonAnimation2.xp, pokemonAnimation2.yp);
                pokemonAnimation2.active = false;
            }
            animations.push(boom);
        }


    }

    requestAnimationFrame(mainLoop);
}


function createFightAnimation(player1, player2, maxExperience) {
    const backAnimations = getBackgroundAnimation();
    pokemonAnimation1 = createPokemonAnimation(player1, true, maxExperience);
    pokemonAnimation2 = createPokemonAnimation(player2, false, maxExperience);


    actions = actions.reverse();

    animations.push(backAnimations[0]);
    animations.push(backAnimations[1]);
    animations.push(backAnimations[2]);
    animations.push(pokemonAnimation1);
    animations.push(pokemonAnimation2);
    animations.push(backAnimations[3]);


    requestAnimationFrame(mainLoop);
}


function createDamageAnimation(xPosition, str) {
    const damageAnimation = new Animation(50);
    damageAnimation.str = str;
    damageAnimation.x = xPosition;
    damageAnimation.y = 250;

    damageAnimation.update = function () {
        this.y -= 5;
        if (this.y < 150) {
            this.active = false;
        }
    };

    damageAnimation.render = function () {
        canvasContext.font = 'bold 30px Arial';
        canvasContext.fillStyle = 'red';
        canvasContext.fillText(this.str, this.x, this.y);
    };

    return damageAnimation;

}

function createBoomAnimation(x, y) {
    const imageInfo = getImageInfoFromType('Boom');

    const boomAnimation = new Animation(imageInfo.rate);
    boomAnimation.w = spriteSize;
    boomAnimation.h = spriteSize;
    boomAnimation.currentFrame = imageInfo.frameCount;
    boomAnimation.frameCount = 10;
    boomAnimation.x = x;
    boomAnimation.y = y;
    boomAnimation.duration = 10;
    boomAnimation.active = true;
    boomAnimation.srcImg = new Image();
    boomAnimation.srcImg.src = imageInfo.src;

    boomAnimation.update = function () {
        if (--this.duration <= 0) {
            this.active = false;
        }
        if (this.currentFrame >= this.frameCount) {
            this.currentFrame = 0;
        }
        this.currentFrame++;
    };

    boomAnimation.render = function () {
        canvasContext.drawImage(this.srcImg, this.w * this.currentFrame, 0, this.w, this.h, this.x, this.y, this.w, this.h);
    };

    return boomAnimation;
}


function createPokemonAnimation(player, left, maxExperience) {
    const imageInfo = getImageInfoFromType(player.type);

    const pokemonAnimation = new Animation(imageInfo.rate);
    pokemonAnimation.player = player;
    pokemonAnimation.w = spriteSize;
    pokemonAnimation.h = spriteSize;
    pokemonAnimation.frameCount = imageInfo.frameCount;
    pokemonAnimation.currentFrame = Math.trunc(Math.random() * imageInfo.frameCount);
    pokemonAnimation.dx = 0;
    pokemonAnimation.xp = left ? 0 : 420;
    pokemonAnimation.yp = imageInfo.yPos;
    pokemonAnimation.srcImg = new Image();
    pokemonAnimation.srcImg.src = imageInfo.src;
    pokemonAnimation.scale = left ? 'left' : 'right';
    pokemonAnimation.hue = Math.round(player.prevExp / maxExperience * 180);

    pokemonAnimation.update = function () {
        if (++this.currentFrame === this.frameCount) {
            this.currentFrame = 0;
        }
        if (isNaN(this.currentPosition)) {
            this.currentPosition = 0;
        }

        if (this.currentPosition > $canvas.width - this.w - this.w * 0.75) {
            this.dx = -(this.dx + 10);
            moveDirection *= -1;

            const damage = createDamageAnimation((this.xp === 0 ? 320 : 100), `-${Math.trunc(currentAction.damage)}hp`);
            const boom = createBoomAnimation(this.xp === 0 ? 320 : 100, 250);

            animations.push(boom);
            animations.push(damage);
        }

        if (this.currentPosition < 0) {
            this.currentPosition = 0;
            this.dx = 0;
        }

        this.currentPosition += this.dx;
    };

    pokemonAnimation.render = function () {
        if (this.scale === 'left') {
            canvasContext.translate(this.w + this.xp, 0);
            canvasContext.scale(-1, 1);
        }

        canvasContext.filter = `hue-rotate(${this.hue}deg)`;
        canvasContext.drawImage(this.srcImg, this.w * this.currentFrame, 0, this.w, this.h, this.xp - this.currentPosition, this.yp, this.w, this.h);
        canvasContext.filter = 'hue-rotate(0deg)';

        if (this.scale === 'left') {
            canvasContext.setTransform(1, 0, 0, 1, 0, 0);
        }
    };

    return pokemonAnimation;
}

function getBackgroundAnimation() {
    let art = new Image();
    art.src = 'scena/1/1.png';

    let backAnimations = [];
    const animation0 = new Animation(25);
    animation0.render = () => {
        canvasContext.drawImage(art, 0, 0, 640, 480, 0, 0, 640, 480);
    };

    const animation1 = new Animation(25);
    animation1.speed = 0.2;
    animation1.sx = 0;
    animation1.sy = 480;
    animation1.dx = 0;
    animation1.w = 1280;

    animation1.update = function () {
        if (moveDirection === -1 && this.dx < -this.w) {
            this.dx = 0;
        }
        if (moveDirection === -1 && this.dx > 0) {
            this.dx -= this.w;
        }
        if (moveDirection === 1 && this.dx > this.w) {
            this.dx = 0;
        }
        if (moveDirection === 1 && this.dx < 0) {
            this.dx += this.w;
        }

        this.dx += (this.speed) * moveDirection;

        if (this.dx < -this.w || this.dx > this.w) {
            this.dx = 0;
        }

    };
    animation1.render = function () {
        canvasContext.drawImage(art, this.dx, this.sy, 640, 480, 0, 0, 640, 480);

        if (moveDirection === -1) {
            if (this.dx < 0) {
                canvasContext.drawImage(art, this.w + this.dx, this.sy, -this.dx, 480, 0, 0, -this.dx, 480);
            }
        }
        if (moveDirection === 1) {
            const lessWidth = this.w - this.dx;
            if (lessWidth < 640) {
                canvasContext.drawImage(art, 0, this.sy, 640 - lessWidth, 480, lessWidth, 0, 640 - lessWidth, 480);
            }
        }
    };

    const animation2 = new Animation(25);
    animation2.speed = 0.5;
    animation2.sx = 0;
    animation2.sy = 960;
    animation2.dx = 0;
    animation2.w = 1280;
    animation2.update = animation1.update;
    animation2.render = animation1.render;

    const animation3 = new Animation(25);
    animation3.speed = 2.5;
    animation3.sx = 0;
    animation3.sy = 1440;
    animation3.dx = 0;
    animation3.w = 1280;
    animation3.update = animation1.update;
    animation3.render = animation1.render;

    backAnimations.push(animation0);
    backAnimations.push(animation1);
    backAnimations.push(animation2);
    backAnimations.push(animation3);
    return backAnimations;
}