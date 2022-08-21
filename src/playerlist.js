let players = [];

const get = () => {
    return players;
}

const add = (uuid) => {
    // initial x and y values represent spawn position
    let player = {
        uuid,
        "x": 30,
        "y": 30,
    };
    players.push(player);
}

const update = (uuid, newX, newY) => {
    players.map(player => {
        if(player.uuid !== uuid) return;

        player.x = newX;
        player.y = newY;
    });
}

module.exports = {
    get,
    add,
    update,
}