const SPECIAL_DAMAGE = 1.3;
const SPECIAL_DAMAGE_PERCENT = 0.5;

function Player(player) {
    this.name = player.name;
    this.type = player.type;
    this.fHealth = 0;
    this.prevExp = 0;
    this.health = 500;
    this.damage = 100;
    this.exp = player.exp;
    this.totalExp = player.exp;
}

Player.prototype.restoreHealth = function () {
  this.fHealth = this.health;
};

Player.prototype.takeDamage = function (player) {
    let damage = player.damage;
    if ((this.type === 'Wood' && player.type=== 'Fire')
    || (player.type=== 'Wood' && this.type === 'Electricity')
    || (player.type=== 'Electricity' && this.type === 'Water')
    || (player.type=== 'Water' && this.type === 'Fire')){

        damage *= (Math.random() <= SPECIAL_DAMAGE_PERCENT ) ? SPECIAL_DAMAGE : 1;
    }
    this.fHealth -= damage;
    return {
        name: this.name,
        playerDamage: player.damage,
        damage: damage
    };
};