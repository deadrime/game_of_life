'use strict';
const WebSocketServer = new require('ws');
const url = require('url');
const LifeGame = require('../lib/LifeGameVirtualDom');


class LifeGameCommunicator {
    constructor() {
        this.clients = {};
        this.webSocketServer = null;
        this.init();
    }

    init() {
        this.webSocketServer = new WebSocketServer.Server({port: 1337});
        this.webSocketServer.on('connection', this.connection.bind(this));
    }

    connection(ws, req) {
        ws.upgradeReq = req;
        const token = url.parse(req.url, true).query.token;
        this.initConnection(token,ws);

        ws.on('message', (msg) => {
            console.log(msg);
            msg = JSON.parse(msg);
            switch(msg.type) {
                case 'ADD_POINT':
                    this.updateState(token, msg.data);
                    break;
                default:
                    console.log('Неизвестный тип');
            }
        });

        ws.on('close', () => {
            console.log('соединение закрыто');
            delete this.clients[token]; // короче вот это немного не работает - this.clients[token].game.sendUpdates() все равно работает и сервак крашится на ws.send()
        });
    }
    
    initConnection(token, ws) {
        const game = new LifeGame();
        
        this.clients[token] = {
            game: game,
            ws: ws
        }

        this.clients[token].game.sendUpdates = (data) => {
            console.log(this.clients[token]);
            ws.send(
                JSON.stringify(
                    {
                        type: 'UPDATE_STATE',
                        data: data
                    }
                )
            )
        }

        this.clients[token].ws.send(
            JSON.stringify(
                {
                    type: 'INITIALIZE',
                    data: {
                        state: game.state,
                        settings: game.settings,
                        user: {
                            token: token,
                            color: '#123'
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
