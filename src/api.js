const { TCPHelper, InstanceStatus } = require('@companion-module/base');

module.exports.initAPI = function () {
	var self = this;

	var cons = [];
	if (self.config.ibc_con_ids) {
		cons = self.config.ibc_con_ids.split(',');
	}

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

			// Cleanup all active tasts and the socket.
			self.destroy();
				
			// New socket.
			var nextIndex = getNextIndex(index, hosts);
			startListeningSocket(nextIndex);
									
			// Restart keep alive task.
			self.KEEPALIVE = setInterval(retrySocket, self.KEEPALIVE_TMR);
		});

		self.socket.on('connect', function () {
			self.updateStatus(InstanceStatus.Ok);			
			self.log('info', 'IHSE draco tera socket connected');
			// Directly send keep alive signal and check master status.
			retrySocket();
		});

		self.socket.on('data', function (data) {
			var cnt = 1;
			var console_length = 50;
			var invalid_bytes = [];
			while(data.length) {

				// Keep alive echo.
				if(data[2] == 0x7a) {
					var telegram_length = data.readInt16LE(3);


					var cmd = data.slice(0, telegram_length);
					grid_byte = cmd[6];
					is_grid_mask = 4;
					is_master_mask = 8;
					is_grid = ((grid_byte & is_grid_mask) === is_grid_mask)
					is_master = ((grid_byte & is_master_mask) === is_master_mask)

					if(is_grid && !is_master) {
						//console.log('is_grid', is_grid, 'is_master', is_master);
						self.updateStatus(InstanceStatus.BadConfig);			
						self.log('error',"Grid error: Connected to sub matrix host " + hosts[index]);

						// Cleanup all active tasts and the socket.
						self.destroy();
							
						// New socket.
						var nextIndex = getNextIndex(index, hosts);
						startListeningSocket(nextIndex);	
												
						// Restart keep alive task.
						self.KEEPALIVE = setInterval(retrySocket, self.KEEPALIVE_TMR);
					}

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

					// We have to be careful with infinit loops caused by echoes created during the following lines of code.
					// That's why we are stopping to listen for echoes until this procedure has finished.
					if(self.listenToEcho) {
						// Login user command.
						if(cmd[2] == 0x65) {
	
							var userid = cmd.readInt16LE(7);
							//console.log(userid);
	
							var conid = cmd.readInt16LE(5);
							//console.log(conid);
	
							if(cons.includes(conid.toString())) {
								// Stop listening for matrix echoes until this procedure is finished.
								self.listenToEcho = false;
	
								// Login user at all defined CONs.
								cons.forEach(conid2 => {
									if(parseInt(conid2) != conid) {
										// Login command.
										var cmd2 = Buffer.from([0x1B, 0x5B, 0x65, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00]);
										cmd2.writeUInt16LE(parseInt(conid2), 5);
										cmd2.writeUInt16LE(parseInt(userid), 7);
										self.socket.send(cmd2);
									}
								});
	
								// Re-start listening for matrix echoes again.
								setTimeout(startListeningToEcho, 500);
	
								// Update button text by companion API call.
								var btn_page 	= 1; // First page is 1
								var btn_row 	= 0; // First row is 0
								var btn_col 	= 7; // First column is 1
								var btn_text 	= `Logged in\nUser ${userid} at\nCON ${conid}`;
								var btn_color 	= '#00FF00';
								var btn_bgcolor	= '#000000';
								var btn_size 	= 14;
								if(userid == 0) {
									btn_text 	= `Logged out`;
									btn_color 	= '#FF0000';
									btn_bgcolor = '#000000';
								}
								//self.setCompanionText(btn_text, btn_page, btn_row, btn_col, btn_color, btn_bgcolor, btn_size);

								// Update dependant custom variables.
								// Update user_id.
								var variableId 		= '$(internal:custom_ihse_user_id)';
								var variableValue 	= userid;
								self.setCompanionVariable(variableId, variableValue)

								// Update logged in status.
								variableId 		= '$(internal:custom_ihse_login_status)';
								variableValue 	= userid > 0 ? 1 : 0;
								self.setCompanionVariable(variableId, variableValue)

								// Reset nfc tag variable.
								if(userid == 0) {
									variableId 		= '$(internal:custom_nfc_tag_id)';
									variableValue 	= 0;
									self.setCompanionVariable(variableId, variableValue)
								}
							}
						}
					}
	

					data = data.slice(telegram_length);
					//console.log(data);
					continue;
				}
				// Invalid echo!
				invalid_bytes.push(data[0])
				data = data.slice(1);
			}

			// Invalid bytes..
			if(invalid_bytes.length) {
				console.log('INVALID');
				console.log(invalid_bytes);
			}
		});
	}

	// Run keep alive function repeatedly.
	self.KEEPALIVE = setInterval(retrySocket, self.KEEPALIVE_TMR);

	// Run establishing connection immediately once.
	retrySocket();


	/**
	 * Re-activate listening to echos.
	 */
	const startListeningToEcho = () => {
		self.listenToEcho = true;
	}

	
	/**
	 * Increase index by 1 until end of hosts list is reached.
	 * At the end of hosts list, start over again.
	 */
	const getNextIndex = (index, hosts) => {
		index = index + 1;
		// Destroy socket and try with next IP address.
		if(hosts.length <= index) {
			// Startover again.
			index = 0
		}
		return index
	}

}
