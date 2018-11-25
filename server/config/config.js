exports.get = function get(env){
	return config[env] || config.default;
}
const config = {
	production:{
		SECRET: process.env.SECRET,
		DATABASE: 'mongodb://valientin:misotu36@ds155663.mlab.com:55663/real-estate12'
	},
	default:{
		SECRET: 'SUPERSECRETPASS',
		DATABASE: 'mongodb://valientin:misotu36@ds155663.mlab.com:55663/real-estate12'
	}
}

exports.get = function get(env){
	return config[env] || config.default;
}