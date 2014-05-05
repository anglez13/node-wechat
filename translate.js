var http = require('http'),
	querystring = require('querystring');

module.exports = function(params,callback) {

	if (typeof params === 'string') {
		params = {
			query: params
		};
	}

	params = {
		from: params.from || 'auto',
		to: params.to || 'auto',
		query: params.query.replace('#','').replace(/\d/,'')
	};
	//console.log(params);

	var data = querystring.stringify(params);
		options = {
			host: 'fanyi.baidu.com',
			port: 80,
			path: '/v2transapi',
			method: 'POST',
			headers: {
				'Content-Type':'application/x-www-form-urlencoded',
				'Content-Length': data.length
			}
		};

	var req = http.request(options, function(res) {
		var result = '';

		res.setEncoding('utf8');
		//res.writeHead(200,{"Content-Type":"text/html"});
		res.on('data', function(data) {
			result += data;
			
		});
		res.on('end', function() {
			var obj = JSON.parse(result),
			    str = obj.trans_result.data[0].dst;
				
				
				//console.log('Baidu --' +str);
				callback(str);
		});
	});

	req.on('error', function(err) {
		console.log(err);
		setTimeout(function() {
			translation(query,callback);
		}, 3000);
	});

	req.write(data);
	req.end();
};