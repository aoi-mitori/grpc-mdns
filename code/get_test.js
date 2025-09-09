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

(async () => {
    // MongoDB //
      const resp = await client('http://localhost:8000/test1/60fd5d803ee7a2464e1f8270', {
          method: 'GET',
      });
      const data = await resp.json();
      console.log(resp);
      console.log("MongoDB message ---> ");
      console.log(data);
  })();
  