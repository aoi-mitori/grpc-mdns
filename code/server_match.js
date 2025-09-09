const mdns = require('multicast-dns')();
const txt = require('dns-txt')();
const fs = require('fs');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const client = require('node-fetch');
var dbId = 0;
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
var InstanceNum = getRandomInt(10000);
var Instance = 'l'+InstanceNum;
var port = 50000+getRandomInt(10000);
var service_proto;
//console.log('tcp.port eq '+port+ '||');
//---------------------------------------------------------------------------------------

(async () => {
  // MongoDB //
    const resp = await client('http://localhost:8000/test1', {
        method: 'POST',
        body: JSON.stringify({
            proto : "syntax=\"proto3\";package lightService;service Light{rpc turnOn(LightRequest)returns(LightReply){}rpc turnOff(LightRequest)returns(LightReply){}}message LightRequest{string time=1;}message LightReply{string message=1;}"     
        })
    });
    console.log(resp);
    const data = await resp.json();
    //console.log("MongoDB message ---> ");
    //console.log(data);
    dbId = data.insertedIds[0];
    console.log(data.status);
    console.log(dbId);
})();


    // start server //
    var PROTO_PATH = __dirname + '/light.proto';
    var packageDefinition = protoLoader.loadSync(
        PROTO_PATH,{
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        }
    );
    function a(){
        service_proto =  grpc.loadPackageDefinition(packageDefinition).lightService;
    }
    function turnOn(call, callback) {
        callback(null, {message: Instance+':  '+call.request.time+": light turn on"});
        console.log(call.request.time+' turn on');
    }
    function turnOff(call, callback) {
        callback(null, {message: Instance+':  '+call.request.time+": light turn off"});
        console.log(call.request.time+' turn off');
    }
    function main(){
        var server = new grpc.Server();
        //console.log(service_proto);
        server.addService(service_proto.Light.service, 
        {   turnOn: turnOn,
            turnOff: turnOff });

        server.bindAsync('0.0.0.0:'+port, grpc.ServerCredentials.createInsecure(),()=>{
            server.start();
        })
    }
    //console.log(packageDefinition);
   

    /*a(function(){
        main();
    });*/
    //main();
    a();
    main();



mdns.on('query', function(query){
  //---------PTR---------//
    // all service //
    if(query.questions[0].name === '_services._dns-sd._udp.local' && query.questions[0].type === 'PTR'){
        console.log(Instance+':got a PTR query');
        mdns.respond({
            answers: [{
            name:'_services._dns-sd._udp.local',
            ttl: 10,
            type: 'PTR',
            data:'_light._udp.local'
            }]
        });
    };
    // _light._udp.local //
    if(query.questions[0].name === '_light._udp.local' && query.questions[0].type === 'PTR'){
        console.log(Instance+':got a PTR query');
        mdns.respond({
            answers: [{
            name:'_light._udp.local',
            ttl: 10,
            type: 'PTR',
            data:Instance+'._light._udp.local'
            }]
        });
    };

    //---------SRV---------//
    if(query.questions[0].name === (Instance+'._light._udp.local') && query.questions[0].type === 'SRV'){
        console.log(Instance+':got a SRV query');
        mdns.respond({
        answers: [{
          name:Instance+'._light._udp.local',
          ttl: 10,
          type: 'SRV',
          data: {
            port: port,
            target:Instance+'.local'
          }
        }]
      });
    };

  //---------TXT---------//
  if(query.questions[0].name === Instance+'._light._udp.local' && query.questions[0].type === 'TXT'){
    console.log(Instance+':got a TXT query');
    
    mdns.respond({
      answers: [{
        name:Instance+'._light._udp.local',
        ttl: 10,
        type: 'TXT',
        data: txt.encode({
            name:'light',
            _id : dbId,
            address : 'http://localhost:8000/test1',
            location: 'livingRoom',
            port: port,
            target:Instance+'.local',
            addr:'0.0.0.0'
        })
      }]
      //additionals: []
          /*
            txt.encode({
                name:'light',
                _id : dbId,
                address : 'http://localhost:8000/test1'
              })
          */
        /*JSON.stringify({
            name:'light',
            _id : dbId,
            address : 'http://localhost:8000/test1'
        })*/
        /*txt.encode({
            name:'light',
            _id : dbId,
            address : 'http://localhost:8000/test1'
        })*/
      
    });
  };

  //---------A---------//
  if(query.questions[0].name === Instance+'.local' && query.questions[0].type === 'A'){
    console.log(Instance+':got a A query');
    mdns.respond({
      answers: [{
        name:Instance+'.local',
        ttl: 10,
        type: 'A',
        data: '0.0.0.0'
      }]
    });
  };


});

