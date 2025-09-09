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
var service_proto =  grpc.loadPackageDefinition(packageDefinition).lightService;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
var port = 50000+getRandomInt(10000);
console.log(port+',');
/**
 * Implements the SayHello RPC method.
 */
function turnOn(call, callback) {
    callback(null, { message: call.request.time + ": light turn on" });
    console.log(call.request.time + ' turn on');
}
function turnOff(call, callback) {
    callback(null, { message:  call.request.time + ": light turn off" });
    console.log(call.request.time + ' turn off');
}
/**
 * Starts an RPC server that receives requests for the Greeter service at the
 * sample server port
 */
//var port = 55313;
function main() {
    var server = new grpc.Server();
    server.addService(service_proto.Light.service,
        {
            turnOn: turnOn,
            turnOff: turnOff
        });

    server.bindAsync('0.0.0.0:' + port, grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    })
    //server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());

}

main();
