let actions = [];
let win = [];

const maxExperience = 5000;
let player1 = null;
let player2 = null;

const allRangeSlector = $('[type="range"]');

let player1Image = null;
let player2Image = null;

const $playerProfile = $('.player-profile');
const $cancelProfile = $('#cancelProfile');

const $player1Name = $('#player1Name');
const $player1Type = $('#Player1Type');
const $player1Exp = $('#player1Exp');
const $player1Range = $('#player1Range');
const $player2Name = $('#player2Name');
const $player2Type = $('#Player2Type');
const $player2Exp = $('#player2Exp');
const $player2Range = $('#player2Range');

const $showProfile = $('#showProfile');
const $player1 = $('#player1');
const $player2 = $('#player2');
const $profile1 = $('#profile1');
const $profile2 = $('#profile2');

const $actionFight = $('#fight');

const $statistics = $('.statistics');
const $fightResult = $('.fight-result');

$(document).ready(function () {
    /**
     * Init materialize css
     */
    $('select').formSelect();
    allRangeSlector.attr('max', maxExperience);
    M.Range.init(allRangeSlector);

    //Hide fight button
    $actionFight.hide();
    $showProfile.hide();
    $playerProfile.hide();
    /**
     * Change pokemon images on type changing
     */
    $player1Type.on('change', () => {
        player1Image = new PokemonPlayerImage({
            type: $player1Type.val(),
            experience: $player1Range.val(),
            maxExperience: maxExperience
        });
        player1Image.setCanvas($('#player1Image')[0]);
        player1Image.flipH(true);
    });

    $player2Type.on('change', () => {
        player2Image = new PokemonPlayerImage({
            type: $player2Type.val(),
            experience: $player2Range.val(),
            maxExperience: maxExperience
        });
        player2Image.setCanvas($('#player2Image')[0]);
    });

    /**
     * Draw exp status in digits
     */
    allRangeSlector.on('change', (el) => {
        const $target = $(el.target);
        setPlayersExp();
        switch ($target.attr('id')) {
            case 'player1Range':
                if (player1Image) {
                    player1Image.setExperience($target.val());
                }
                break;
            case 'player2Range':
                if (player2Image) {
                    player2Image.setExperience($target.val());
                }
                break;
        }
    });

    /**
     * If something change in pokemon data, check it and hide or show fight button.
     */
    $('.menu_select').on('change', () => {
        if (checkPlayers()) {
            $actionFight.show();
            $showProfile.show();
        } else {
            $actionFight.hide();
            $showProfile.hide();
        }
    });

    $actionFight.on('click', () => {
        actions = [];
        animations = [];
        if (!player1) {
            player1 = new Player({
                name: $player1Name.val(),
                type: $player1Type.val(),
                exp: Number($player1Range.val())
            });
        }

        player2 = getPlayer2();
        showPlayer2();
        showProfile();
        $player1.hide();
        $player2.hide();
        $profile1.show();
        $profile2.show();
        $cancelProfile.hide();
        $actionFight.hide();
        // setTimeout(() => {
        actions = [];
        fight(player1, player2, () => {
            showProfile();
            $profile2.hide();
            $player2.show();
            $actionFight.show();
            if (player1.fHealth > 0) {
                win.push(JSON.parse(JSON.stringify(player2)));
                $fightResult.text('You Win!');
                player1Image.setExperience(player1.totalExp);
            } else {
                $profile1.hide();
                $player1.show();
                $fightResult.text('You Loose!');
            }
            createFightAnimation(player1, player2, maxExperience);
            console.log(actions);
            showStatistics();
        });
        // }, 100);
    });

    $showProfile.on('click', (ev) => {
        player1 = new Player({
            name: $player1Name.val(),
            type: $player1Type.val(),
            exp: Number($player1Range.val())
        });
        ev.preventDefault();
        $player1.hide();
        $profile1.show();
        showProfile();
    });

    $cancelProfile.on('click', () => {
        player1 = null;
        $player1.show();
        $profile1.hide();
    });

    setPlayersExp();
    requestAnimationFrame(playersLoop);

});

function setPlayersExp() {
    $player1Exp.text(`Player experience: ${$player1Range.val()}`);
    $player2Exp.text(`Player experience: ${$player2Range.val()}`);
}

function checkPlayers() {
    let status = true;
    if (player1Image) {
        if ($player1Name.val() !== "") {
            player1Image.setBackground('green');
        } else {
            player1Image.setBackground('white');
            status = false;
        }
    }
    if (player2Image) {
        if ($player2Name.val() !== "") {
            player2Image.setBackground('green');
        } else {
            player2Image.setBackground('white');
            status = false;
        }
    }

    if (!player1Image || !player2Image || $player1Name.val() === $player2Name.val()) {
        return false;
    }


    return status;
}

function playersLoop(time) {
    if (player1Image) player1Image.run(time);
    if (player2Image) player2Image.run(time);
    requestAnimationFrame(playersLoop);
}


function showProfile() {
    $('#profile1 .name').text(`Name: ${player1.name}`);
    $('#profile1 .type').text(`Type: ${player1.type}`);
    $('#profile1 .health')
        .text(`Health: ${player1.health}`)
        .append($('<span>+</span>')
            .css('cursor', 'pointer')
            .on('click', () => {
                if (player1.exp >= 100) {
                    player1.exp -= 100;
                    player1.health += 10;
                }
                showProfile();
            }));
    $('#profile1 .damage')
        .text(`Damage: ${player1.damage}`)
        .append($('<span>+</span>')
            .css('cursor', 'pointer')
            .on('click', () => {
                if (player1.exp >= 100) {
                    player1.exp -= 100;
                    player1.damage += 10;
                }
                showProfile();
            }));
    $('#profile1 .exp').text(`Free exp: ${player1.exp}`);
    $('#profile1 .total-exp').text(`Total exp: ${player1.totalExp}`);
}

function showPlayer2() {
    $('#profile2 .name').text(`Name: ${player2.name}`);
    $('#profile2 .type').text(`Type: ${player2.type}`);
    $('#profile2 .health').text(`Health: ${player2.health}`);
    $('#profile2 .damage').text(`Damage: ${player2.damage}`);
    $('#profile2 .exp').text(`Exp: ${player2.exp}`);
}

function getPlayer2() {
    const player = new Player({
        name: $player2Name.val(),
        type: $player2Type.val(),
        exp: Number($player2Range.val())
    });

    const damage = Math.trunc((player.exp * Math.random()) / 10);
    const health = Math.trunc((player.exp - damage * 10) / 10);
    player.damage += damage;
    player.health += health;
    player.exp = 0;

    return player;
}

function showStatistics() {
    $statistics.html('');
    const $list = $('<ul></ul>');
    win.forEach((el) => {
        $list.append(`<li>Name: ${el.name}, Type: ${el.type}, Health: ${el.health}, Damage: ${el.damage}, Exp: ${el.totalExp}</li>`);
    });
    $statistics.append($list);

}


function fight(pokemon1, pokemon2, callback) {
    pokemon1.prevExp = pokemon1.totalExp;
    pokemon2.prevExp = pokemon2.totalExp;
    console.log(pokemon1);
    pokemon1.restoreHealth();
    pokemon2.restoreHealth();
    let pokemonQueue = Math.random() >= 0.5;
    while (pokemon1.fHealth > 0 && pokemon2.fHealth > 0) {
        if (pokemonQueue) {
            actions.push(pokemon1.takeDamage(pokemon2));
        } else {
            actions.push(pokemon2.takeDamage(pokemon1));
        }
        pokemonQueue = !pokemonQueue;
    }

    if (pokemon1.fHealth > 0) {
        pokemon1.exp += 500 + pokemon1.fHealth;
        pokemon1.totalExp += 500 + pokemon1.fHealth;
    }
    if (pokemon2.fHealth > 0) {
        pokemon2.exp += 500 + pokemon2.fHealth;
        pokemon2.totalExp += 500 + pokemon2.fHealth;
    }
    console.log(pokemon1);
    callback();
}
