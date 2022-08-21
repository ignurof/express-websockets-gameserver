let players = [];

const getAll = () => {
    return new Promise((resolve) => {
        resolve(players);
    });
}

const get = (uuid) => {
    return new Promise((resolve) => {
        players.map(player => {
            if(player.uuid !== uuid) return;

            resolve(player);
        });
    });
    // players.map(player => {
    //     if(player.uuid !== uuid) return;

    //     return player;
    // });
}

const add = (uuid) => {
    return new Promise((resolve) => {
        let player = {
            uuid,
            "x": 620,
            "y": 300,
        };
        players.push(player);
        resolve(true);
    });
    // // initial x and y values represent spawn position
    // let player = {
    //     uuid,
    //     "x": 620,
    //     "y": 300,
    // };
    // players.push(player);
}

const update = (uuid, newX, newY) => {
    players.map(player => {
        if(player.uuid !== uuid) return;

        player.x = newX;
        player.y = newY;
    });
}

module.exports = {
    getAll,
    get,
    add,
    update,
}