const IMAGE_TITLE_SIZE = 200;

function getImageInfoFromType(type) {
    switch (type) {
        case 'Electricity':
            return {
                src: 'assets/pokemons/1.png',
                frameCount: 10,
                rate: 50,
                yPos: 200
            };
        case 'Wood':
            return {
                src: 'assets/pokemons/5.png',
                frameCount: 31,
                rate: 50,
                yPos: 275
            };
        case 'Fire':
            return {
                src: 'assets/pokemons/2.png',
                frameCount: 72,
                rate: 50,
                yPos: 275
            };
        case 'Water':
            return {
                src: 'assets/pokemons/water.png',
                frameCount: 8,
                rate: 50,
                yPos: 275
            };
        case 'Boom':
            return {
                src: 'assets/boom.png',
                frameCount: 10,
                rate: 90,
                yPos: 100
            };
    }
}

function PokemonPlayerImage(player) {
    this.type = player.type;
    this.width = IMAGE_TITLE_SIZE;
    this.height = IMAGE_TITLE_SIZE;
    this.rate = getImageInfoFromType(player.type).rate;
    this.lastTime = 0;
    this.frameCount = getImageInfoFromType(player.type).frameCount;
    this.img = new Image();
    this.img.src = getImageInfoFromType(player.type).src;
    this.frame = 0;
    this.flip = false;
    this.exp = player.experience;
    this.maxExp = player.maxExperience;
    this.background = 'white';
    this.hue = 0;
}

PokemonPlayerImage.prototype.setExperience = function (exp) {
    this.exp = exp;
    this.hue = Math.round(this.exp / this.maxExp * 180);
};

PokemonPlayerImage.prototype.update = function () {
    if (++this.frame === this.frameCount) {
        this.frame = 0;
    }
};

PokemonPlayerImage.prototype.run = function (time) {

    if (time > this.rate + this.lastTime) {
        this.lastTime = time;
        this.update();
    }
    this.render();
};

PokemonPlayerImage.prototype.flipH = function (state) {
    this.flip = state;
};

PokemonPlayerImage.prototype.setBackground = function (color) {
    this.background = color;
};

PokemonPlayerImage.prototype.render = function () {
    this.canvasContext.rect(0, 0, IMAGE_TITLE_SIZE, IMAGE_TITLE_SIZE);
    this.canvasContext.fillStyle = this.background;
    this.canvasContext.fill();
    if (this.flip) {
        this.canvasContext.translate(this.width, 0);
        this.canvasContext.scale(-1, 1);
    }
    this.canvasContext.filter = `hue-rotate(${this.hue}deg)`;
    this.canvasContext.drawImage(this.img, this.frame * this.width, 0, IMAGE_TITLE_SIZE, IMAGE_TITLE_SIZE, 0, 0, IMAGE_TITLE_SIZE, IMAGE_TITLE_SIZE);
    this.canvasContext.filter = 'hue-rotate(0deg)';
    if (this.flip) {
        this.canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    }
};

PokemonPlayerImage.prototype.setCanvas = function (canvas) {
    this.canvasContext = canvas.getContext('2d');
};

