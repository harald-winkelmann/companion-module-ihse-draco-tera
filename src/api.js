const { TCPHelper, InstanceStatus } = require('@companion-module/base');

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

		self.listenToEcho = true;
		
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
			// Keep alive echo.
			if(data[2] == 0x7a) {
				return;
			}
			// Command successful executed.
			if(data[0] == 0x06) {
				console.log('OK'); 
				data = data.slice(1);
			}
			// Command error.
			if(data[0] == 0x15) {
				console.log('ERROR'); 
				data = data.slice(1);
			}
			// Matrix busy. Command not executed.
			if(data[0] == 0x07) {
				console.log('BUSY'); 
				data = data.slice(1);
			}
			// Matrix echo.
			if(data.length) {
				console.log('LAN ECHO');
				console.log(data);
				if(self.listenToEcho) {
					// Login user command.
					if(data[2] == 0x65) {
						// Stop listening for matrix echoes until this prcedure is finished.
						self.listenToEcho = false;

						var cons = self.config.ibc_con_ids.split(',');
						var userid = data.readInt16LE(7);
						//console.log(userid);

						// Login user at all defined CONs.
						cons.forEach(conid => {
							//console.log(conid);
							var cmd = Buffer.from([0x1B, 0x5B, 0x65, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00]);
							cmd.writeUInt16LE(parseInt(conid), 5);
							cmd.writeUInt16LE(parseInt(userid), 7);
							self.socket.send(cmd);
						});

						// Re-start listening for matrix echoes again.
						setTimeout(startListeningToEcho, 500);

						// Update button text by companion API call.
						self.callApi(userid);
					}
				}
			}
		});
	}

	// Run keep alive function repeatedly.
	self.KEEPALIVE = setInterval(retrySocket, 25000);

	// Run establishing connection immediately once.
	retrySocket();


	/**
	 * Re-activate listening to echos.
	 */
	const startListeningToEcho = () => {
		self.listenToEcho = true;
	}

}
