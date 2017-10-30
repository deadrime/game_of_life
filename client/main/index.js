'use strict';

let game = null;

const INITIALIZE = (data,ws) => {
    game = new LifeGame(data.user, data.settings);
    game.init();
    game.setState(data.state);
    game.send = (data) => {
      const type = 'ADD_POINT';
      ws.send(JSON.stringify({type, data}));
    };
};

const UPDATE_STATE = data => {
    game.setState(data);
};

App.onToken = (username) => {
    const socket = new WebSocket(`ws://localhost:1337/?token=${username}`);
    socket.onopen = () => {
        console.log(`token: ${username}`);
    };
    socket.onerror = (error) => {
        console.log("Ошибка " + error.message);
    };
    const msgHandler = (msg) => {
        msg = JSON.parse(msg.data);
        if (msg.type === 'INITIALIZE') {
            INITIALIZE(msg.data, socket);
        }
        if (msg.type ==='UPDATE_STATE') {
            UPDATE_STATE(msg.data)
        }
    }
    socket.onmessage = msgHandler;
}

