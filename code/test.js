var exec = require('child_process');
//var child = exec.exec('node client.js');


for(var i=0;i<3;i++){
    console.log(i+1);
    var child = exec.exec('node server_match.js');
    child.stdout.pipe(process.stdout)
}

for(var i=0;i<7;i++){
    console.log(i+1);
    var child = exec.exec('node server_others.js');
    child.stdout.pipe(process.stdout)
}

// for(var i=0;i<10;i++){
//     console.log(i+1);
//     var child = exec.exec('node grpc_server.js');
//     child.stdout.pipe(process.stdout)
// }
// for(var i=0;i<1000;i++){
//     //console.log(i+1);
//     var child = exec.exec('node grpc_client.js');
//     child.stdout.pipe(process.stdout)
// }

