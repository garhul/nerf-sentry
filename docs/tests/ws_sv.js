const static = require('node-static');
const file = new static.Server('./public');
const WebSocketServer = require('websocket').server;
const http = require('http');

const WS_PORT=5000;
const WEB_SERVER=8080;

const isOriginAllowed = origin => {
  return true;
}

// --- WEB server to serve static files from public dir ---//

http.createServer( (req, res) => {
    console.log(`${new Date()} received request`);
    req.addListener('end', () => file.serve(req, res)).resume();
}).listen(WEB_SERVER);

//--- WEB server to handle websockets ---//

const ws_http = http.createServer((req, res) => {
    console.log(`${new Date()} Received request for ${req.url}`);
    res.writeHead(404);
    res.end();
}).listen(WS_PORT);

wsServer = new WebSocketServer({
    httpServer: ws_http,
    autoAcceptConnections: false
});

wsServer.on('request', request => {
    if (!isOriginAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    const connection = request.accept('protocol', request.origin);
    console.log(`${new Date()} Connection accepted.`);

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.dir(message);
            // console.log('Received Binary Message ' + message.binaryData + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
