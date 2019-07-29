// px2nodeconnector.js

var net = require('net');

px2nodeconnector = module.exports = function () {
    var self = this;
    
    self.client = null;
    self.recvBuf = new Buffer(1024);
    self.recvLength = 0;
    self.onRecvFun = null;

    px2nodeconnector.prototype.initlize = function () {
        var self = this;

        self.client = new net.Socket();
        self.client.on('connect', function(){
            console.log("connected");
        });
        self.client.on('data', function(data){
            var dtLength = data.length;
            data.copy(self.recvBuf, self.recvLength);
            self.recvLength += dtLength;

            if (self.recvLength > 4)
            {
                var bufLength = self.recvBuf.readUInt16LE(0);
                var allBufLength = bufLength + 2;
                var butProtoType = self.recvBuf.readUInt16LE(2);
                console.log("bufLength:" + bufLength);
                console.log("butProtoType:" + butProtoType);
              
                if (self.recvLength >= allBufLength){
                    self.recvLength -= allBufLength;
              
                  var cntBuf = new Buffer(bufLength);
                  data.copy(cntBuf, 0, 4, 4+bufLength);
              
                  if (2 == butProtoType){
                    var cntStr = cntBuf.toString();
    
                    console.log(cntStr);
    
                    if (null != self.onRecvFun){
                        self.onRecvFun(cntStr);
                    }
                  }
                }
            }
        });
    };
    self.initlize();

    px2nodeconnector.prototype.sendStr = function(str){
        var self = this;

        var bufStr = new Buffer(str);

        var bufLength = new Buffer(4);
        bufLength.writeUInt16LE(bufStr.length + 2, 0);
        bufLength.writeUInt16LE(2, 2);
      
        var buf = new Buffer(bufStr.length + 4);
        bufLength.copy(buf, 0);
        bufStr.copy(buf, 4);
      
        self.client.write(buf);
    };

    px2nodeconnector.prototype.onRecvStr = function(fun){
        var self = this;

        self.onRecvFun = fun;
    };

    px2nodeconnector.prototype.connect = function(ip, port){
        var self = this;

        self.client.connect(port, ip);
    };
}