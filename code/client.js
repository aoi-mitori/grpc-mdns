const mdns = require('multicast-dns')();
const txt = require('dns-txt')();
const fs = require('fs');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const client = require('node-fetch');
//--------------------------------------------------------------//
//---------PTR---------//
// all services //

/*mdns.query({
    questions: [{
        name: '_services._dns-sd._udp.local',
        type: 'PTR'
    }]
});
mdns.on('response', function (response) {
    if (response.answers[0].name === '_services._dns-sd._udp.local' && response.answers[0].type === 'PTR') {
        console.log('got a PTR response packet:', response.answers[0].data);
    }
});
*/
let t1 = new Date().getTime();
let t2 = t1;
// _light._udp.local //
mdns.query({
    questions: [{
        name: '_light._udp.local',
        type: 'PTR'
    }]
});

mdns.on('response', function (response) {
    let target = "";
    let port = 0;
    let service_proto;

    if (response.answers[0].name === '_light._udp.local' && response.answers[0].type === 'PTR') {
        //console.log('got a PTR response packet:', response.answers[0].data);

        let ins = response.answers[0].data;
        //---------SRV---------//
        // mdns.query({
        //     questions: [{
        //         name: ins,
        //         type: 'SRV'
        //     }]
        // });
        mdns.on('response', function (response) {
            if (response.answers[0].name === ins && response.answers[0].type === 'SRV') {
                port = response.answers[0].data.port;
                target = response.answers[0].data.target;
            }
        });

        //---------TXT---------//
        mdns.query({
            questions: [{
                name: ins,
                type: 'TXT'
            }]
        });
        mdns.on('response', function (response) {
            if (response.answers[0].name === ins && response.answers[0].type === 'TXT') {
                let txtPackage = txt.decode(response.answers[0].data[0]);

                if (txtPackage.location === 'livingRoom') {
                    let MongoDB_address = txtPackage.address;
                    let id = txtPackage._id;
                    console.log(MongoDB_address + '/' +id);
                    //MongoDB //
                    (async () => {
                        const resp = await client(MongoDB_address + '/' +id, {
                            method: 'GET'
                        });
                        const data = await resp.json();
                        console.log(data);
                        let proto = data.proto;
                        fs.writeFileSync('client_service.proto', proto);
                        var PROTO_PATH = __dirname + '/client_service.proto';
                        var packageDefinition = protoLoader.loadSync(
                            PROTO_PATH, {
                            keepCase: true,
                            longs: String,
                            enums: String,
                            defaults: true,
                            oneofs: true
                        }
                        );
                        service_proto = grpc.loadPackageDefinition(packageDefinition).lightService;

                        let addr = txtPackage.addr;
                        port = txtPackage.port;
                        function main() {
                            var client = new service_proto.Light(addr + ':' + port,
                                grpc.credentials.createInsecure());

                            client.turnOn({ time: '20210510' }, function (err, response) {
                                console.log(response.message);
                                t2 = Date.now();
                                let interval = t2-t1;
                                console.log(interval);
                            });
                        }
                        main();
                        //---------A---------//
                        // mdns.query({
                        //     questions: [{
                        //         name: target,
                        //         type: 'A'
                        //     }]
                        // });
                    })();

                    //---------A---------//
                    mdns.on('response', function (response) {
                        if (response.answers[0].name === target && response.answers[0].type === 'A') {
                            let address = response.answers[0].data;
                            console.log(port);
                            function main() {
                                var client = new service_proto.Light(address + ':' + port,
                                    grpc.credentials.createInsecure());

                                client.turnOn({ time: '20210510' }, function (err, response) {
                                    console.log(response.message);
                                    t2 = Date.now();
                                    let interval = t2-t1;
                                    console.log(interval);
                                });
                            }
                            main();
                        }
                    });
                }
            }
        });
    }
});


