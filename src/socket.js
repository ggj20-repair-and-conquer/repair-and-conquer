let socket = {
    ws: null,
    gameData: {},
    init() {
        if (window.location.hostname == 'localhost') {
            this.ws = new WebSocket('ws://localhost:9000');
        } else {
            this.ws = new WebSocket('ws://pionlib.de:9000');
        }

        this.ws.onerror = function() {
        };

        this.ws.onclose = function() {
            location.reload();
        }
    },
    sendToServer(data) {
        this.ws.send(JSON.stringify(data));
    },
    getFromServer(func) {
        this.ws.onmessage = function(msg) {
            func(JSON.parse(msg.data));
        }
    }
};

socket.init();