var PROTO_PATH = __dirname + '/light.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var service_proto = grpc.loadPackageDefinition(packageDefinition).lightService;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
let ins  = [];
function main() {
    let t1 = new Date().getTime();
    let t2 = t1;
    let ports = [
        54620,
59917,
58227,
52363,
55000,
54293,
53889,
56671,
53212,
59147
    ];
    for (let i = 0; i < 3; i++) {
        //let port = getRandomInt(20);
        port = ports[i];
        //port = ports[port];
        //console.log('tcp.port eq '+port+'||');
        var client = new service_proto.Light('0.0.0.0:' + port,
            grpc.credentials.createInsecure());
        client.turnOn({ time: '20210510' }, function (err, response) {
            //console.log(response.message); 
            t2 = Date.now();
            let interval = t2 - t1;
            ins.push(interval);
            console.log(ins);
        });        
    }
}
main();
