var http = require("http")
var https = require("https")


//------------------------------------------------------------------------------
//  Global variables
//------------------------------------------------------------------------------
var config = null;

//------------------------------------------------------------------------------
//  APIs
//------------------------------------------------------------------------------
exports.SetConfig = function(cfg) {
  config = cfg;
}

exports.GetNormalTxList = function(address, callback) {
  params = '?module=account';
  params += '&action=txlist';
  params += '&startblock=0';
  params += '&endblock=99999999';
  params += '&address=' + address;
  params += '&sort=asc';
  params += '&apikey=' + config.etherscan_api.key;
  ProcessHttpRequest(config.etherscan_api.host, config.etherscan_api.port, 'GET', '/api' + params, '', callback);
}

exports.GetInternalTxList = function(address, callback) {
  params = '?module=account';
  params += '&action=txlistinternal';
  params += '&startblock=0';
  params += '&endblock=99999999';
  params += '&address=' + address;
  params += '&sort=asc';
  params += '&apikey=' + config.etherscan_api.key;
  ProcessHttpRequest(config.etherscan_api.host, config.etherscan_api.port, 'GET', '/api' + params, '', callback);
}

//------------------------------------------------------------------------------
//  Utils
//------------------------------------------------------------------------------

var ProcessHttpRequest = function(host, port, method, path, requestBody, callback) {
  ProcessRequest(host, port, method, path, requestBody, false, callback);
}

var ProcessHttpsRequest = function(host, port, method, path, requestBody, callback) {
  ProcessRequest(host, port, method, path, requestBody, true, callback);
}

var ProcessRequest = function(host, port, method, path, requestBody, useHttps, callback) {

  var options = {
    host: host,
    port: port,
    method: method,
    path: path,
    headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(requestBody), 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'}
  };
  if (config.log.log_level == 'debug'){
    console.log('[Debug] ____');
    console.log('[Debug] Http request: ' + JSON.stringify(options));    
    console.log('[Debug] ' + requestBody);
  }

  http_client = useHttps? https : http;
  
  try {
    var req = http_client.request(options, function(res) { 
      var body = '';
      res.setEncoding('utf8');
      res.on('data', function(dataBlock) {
        body += dataBlock;
      });
      res.on('end', function() {
        if (config.log.log_level == 'debug'){
          console.log('[Debug]' + body);
          console.log('[Debug] ____');
        }

        if (callback) { callback(null, body); }
      });
    });

    req.setTimeout(10000, function() {
      req.abort();
      callback('Request Timeout: ' + path, null);
      callback = null;
    });

    req.on('error', function(error) {
      console.log('req error: ' + error)
      if (callback) { callback(error, null); }
    });

    req.write(requestBody);
    req.end();
  }
  catch(error) {
    callback(error.stack, null);
  }
}