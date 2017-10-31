'use strict';
const WebSocket = new require('ws');
const url = require('url');
const LifeGame = require('../lib/LifeGameVirtualDom');
const randomHexColor = require('random-hex-color')


class LifeGameCommunicator {
    constructor() {
        this.clients = {};
        this.webSocketServer = null;
        this.init();
    }

    verifyClient(args) {
        const token = url.parse(args.req.url, true).query.token;
        console.log(`Successful authorization, token ${token}`);
        if (!token) {
            ws.terminate();
            return false;
        }
        return true;
    }

    init() {
        const port = 1337;
        const verifyClient = this.verifyClient;
        this.webSocketServer = new WebSocket.Server({
            port: port, 
            verifyClient
        });
        this.webSocketServer.on('connection', this.connection.bind(this));
    }

    connection(ws, req) {
        ws.upgradeReq = req;
        const token = url.parse(req.url, true).query.token;
        this.initConnection(token,ws);

        ws.on('message', (msg) => {
            msg = JSON.parse(msg);
            switch(msg.type) {
                case 'ADD_POINT':
                    this.updateState(token, msg.data);
                    break;
                default:
                    console.log(`Unknown message type: ${msg.type}`);
            }
        });

        ws.on('close', () => {
            console.log(`Client with token ${token} disconnected`);
            this.clients[token].pause = true;
            this.clients[token].game.pause();
        });
    }
    
    initConnection(token, ws) {
        if (!(token in this.clients)) { // Если новый клиент
            console.log(`New client with token ${token}`);
            const game = new LifeGame(); // создаем для него новую игру
            const color = randomHexColor(); // задаем ему рандомный цвет
            this.clients[token] = {
                game: game,
                ws: ws,
                pause: false,
                color: color
            }
        }
        else { // иначе - возобновляем старую сессию
            console.log(`Client with token ${token} reconnected`);
            this.clients[token].ws = ws; 
            this.clients[token].pause = false;
            this.clients[token].game.resume();
        }

        this.clients[token].game.sendUpdates = (data) => { // в любом случае переопределяем sendUpdates для нового ws
            if (!this.clients[token].pause) {
                ws.send(
                    JSON.stringify(
                        {
                            type: 'UPDATE_STATE',
                            data: data
                        }
                    )
                )
            }
        }

        this.clients[token].ws.send( // инициализируем игру 
            JSON.stringify(
                {
                    type: 'INITIALIZE',
                    data: {
                        state:  this.clients[token].game.state,
                        settings: this.clients[token].game.settings,
                        user: {
                            token: token,
                            color: this.clients[token].color
                        }
                    }
                }
            )
        );
    }

    updateState(token, data) {
        this.clients[token].game.applyUpdates(data);
    }
}

new LifeGameCommunicator();
