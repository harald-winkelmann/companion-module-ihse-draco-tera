const { TCPHelper, InstanceStatus } = require('@companion-module/base')

module.exports.initAPI = function () {
	var self = this;

	if(self.KEEPALIVE) {
		clearInterval(self.KEEPALIVE);
		delete self.KEEPALIVE;
	}

	if (self.socket) {
		self.socket.destroy();
		console.log('socked destroyed');
		delete self.socket;
		console.log('socked deleted');
	}

	const retrySocket = () => {
		// Ping matrix to keep connection alive
		try {
			// Establish new socket
			if (!self.socket) {
				if (self.config.host && self.config.host !== '') {
					startListeningSocket(0);
				}
			}
			// Existing socket
			else if (self.socket && self.socket.isConnected) {
				// Get status command
				var cmd = Buffer.from([0x1B, 0x5B, 0x7A]);
				self.socket.send(cmd);
				self.log('debug','Keep alive socket');
			}
		} catch (err) {
			self.log('error', 'Error with handling socket' + JSON.stringify(err));
		}
	}

	/**
	 * Create a socket connection
	 */
	const startListeningSocket = (index) => {
		var hosts = self.config.host.split(',');
		self.log('info', 'startListeningSocket... ');
		self.log('info', 'Try socket connection to host ' + hosts[index]);

		
		self.socket = new TCPHelper(hosts[index], self.config.port, {rejectUnauthorized: false});

		self.socket.on('status_change', function (status, message) {
			//console.log(this); 
			self.updateStatus(status);			
			self.log('info', 'IHSE draco tera socket ' + status);
		});

		self.socket.on('error', function (err) {
			self.updateStatus(InstanceStatus.ConnectionFailure);			
			self.log('error',"Network error: " + err.message);
			var nextIndex = index +1;
			// Destroy socket and try with next IP address.
			if(hosts.length == nextIndex) {
				// Startover again.
				nextIndex = 0
			}
			self.socket.destroy();			
			self.log('error','socked destroyed');
			delete self.socket;
			self.log('error','socked deleted');
				
			startListeningSocket(nextIndex);
		});

		self.socket.on('connect', function () {
			self.updateStatus(InstanceStatus.Ok);			
			self.log('info', 'IHSE draco tera socket connected');
		});

		self.socket.on('data', function (data) {
			var cnt = 1;
			var console_length = 50;
			while(data.length) {

				// Keep alive echo.
				if(data[2] == 0x7a) {
					var telegram_length = data.readInt16LE(3);
					data = data.slice(telegram_length);
					continue;
				}
				// Command successful executed.
				if(data[0] == 0x06) {
					console.log(new Date().toISOString(), 'OK'.padEnd(self.console_ident), data); 
					data = data.slice(1);
					continue;
				}
				// Command error.
				if(data[0] == 0x15) {
					console.log(new Date().toISOString(), 'ERROR'.padEnd(self.console_ident), data); 
					data = data.slice(1);
					continue;
				}
				// Matrix busy. Command not executed.
				if(data[0] == 0x07) {
					console.log(new Date().toISOString(), 'BUSY'.padEnd(self.console_ident), data); 
					data = data.slice(1);
					continue;
				}
				// Matrix telegram echo.
				if(data[0] == 0x1B) {
					if(cnt == 1) {
						console.log(new Date().toISOString(), 'ECHO'.padEnd(self.console_ident), data);
					}
					cnt++;
					var telegram_length = data.readInt16LE(3);
					var cmd = data.slice(0, telegram_length);
					var additional = '';
					if(telegram_length > console_length) { additional = '... more';}
					console.log(' '.padEnd(self.console_ident), cmd.slice(0, console_length), additional);
					data = data.slice(telegram_length);
					//console.log(data);
					continue;
				}

			}
		});
	}

	// Run keep alive function repeatedly.
	self.KEEPALIVE = setInterval(retrySocket, 25000);

	// Run establishing connection immediately once.
	retrySocket();
}
