var exec = require('child_process');

for(var i=0;i<10;i++){
    //console.log(i+1);
    var child = exec.exec('node grpc_client.js');
    child.stdout.pipe(process.stdout)
}