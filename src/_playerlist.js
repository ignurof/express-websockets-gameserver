let players = [];

const get = () => {
    return players;
}

const add = (id) => {
    let player = {
        id,
        "x": 30, // Startpos
        "y": 30,
        "anim": "nameHere",
        "flipH": false,
        "attacking": false,
        "hp": 100
    };
    players.push(player);
}

const update = (id, nX, nY, nAnim, nFlipH, nAttacking) => {
    players.map(v => {
        if(v.id !== id) return;

        v.x = nX;
        v.y = nY;
        v.anim = nAnim;
        v.flipH = nFlipH;
        v.attacking = nAttacking;
    });
}

const attack = (id) => {
    players.map(v => {
        if(v.id !== id) return;

        v.hp -= 10;
    });
}

const isDead = (id) => {
    let value = false;
    players.map(v => {
        if(v.id !== id) return;

        if(v.hp <= 0) value = true;
    });
    return value;
}

const heal = (id) => {
    players.map(v => {
        if(v.id !== id) return;

        v.hp = 100;
        v.x = 30;
        v.y = 30;
    });
}

module.exports = {
    get,
    add,
    update,
    attack,
    isDead,
    heal
}