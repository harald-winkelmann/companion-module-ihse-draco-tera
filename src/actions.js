const { Regex } = require('@companion-module/base')

module.exports.initActions = function () {
	var self = this
		
	let actions = {

		'set-extended-connection': {
			name: 'Set extended connection',
			options: [{
				type: 'textinput',
				label: 'CON',
				id: 'con',
				default: '',
				tooltip: 'Enter CON Number',
				regex: Regex.NUMBER
			},{
				type: 'textinput',
				label: 'CPU',
				id: 'cpu',
				default: '',
				tooltip: 'Enter CPU Number',
				regex: Regex.NUMBER
			},{
				type: 'dropdown',
				label: 'MODE',
				id: 'mode',
				default: '0',
				choices: [
						{ id: '0', label: 'Full Access' },
						{ id: '1', label: 'Video Only' },
						{ id: '3', label: 'Private Mode' }
				],
				tooltip: 'Enter Connection mode'
			}],
			callback: async function (action) {
				self.executeAction(action);
			}
		},

		'set-multiscreen-ctrl': {
			name: 'Set multiscreen control console',
			options: [{
				type: 'textinput',
				label: 'Index of IO board',
				id: 'ioidx',
				default: '',
				tooltip: 'Enter IO board number',
				regex: Regex.NUMBER
			},{
				type: 'textinput',
				label: 'Port of control CON',
				id: 'ctrlport',
				default: '',
				tooltip: 'Enter port number',
				regex: Regex.NUMBER
			},{
				type: 'textinput',
				label: 'Device id of control CON',
				id: 'ctrlid',
				default: '',
				tooltip: 'Enter device id of control CON',
				regex: Regex.NUMBER
			},{
				type: 'textinput',
				label: 'Enter device id of MSC CON to be controlled',
				id: 'mscid',
				default: '',
				tooltip: 'Enter device id of msc CON',
				regex: Regex.NUMBER
			}],
			callback: async function (action) {
				self.executeAction(action);
			}
		},

		'send-message': {
			name: 'Send message to console',
			options: [{
				type: 'textinput',
				label: 'CON ids comma seperated',
				id: 'conids',
				default: '',
				tooltip: 'Enter CON ids seperated by commas\r0 means all consoles',
				regex: '/^([0-9]+)(,[0-9]+)*$/'
			},{
				type: 'textinput',
				label: 'Message text',
				id: 'msg',
				default: '',
				tooltip: 'Enter message \rOnly ASCII characters allowed \rMaximum length 62 characters'
			},{
				type: 'textinput',
				label: 'Duration',
				id: 'time',
				default: '10',
				tooltip: 'Enter time in seconds',
				regex: Regex.NUMBER
			}],
			callback: async function (action) {
				self.executeAction(action);
			}
		},

		'login-user': {
			name: 'Login user at console',
			options: [{
				type: 'textinput',
				label: 'CON id',
				id: 'conid',
				default: '',
				tooltip: 'Enter CON id',
				regex: Regex.NUMBER
			},{
				type: 'textinput',
				label: 'USER id',
				id: 'userid',
				default: '',
				tooltip: 'Enter USER id',
				regex: Regex.NUMBER
			}],
			callback: async function (action) {
				self.executeAction(action);
			}
		},
		
		'exec-macro-at-con': {
			name: 'Execute Macro at a CON Device',
			options: [{
				type: 'dropdown',
				label: 'Macro',
				id: 'macro',
				default: '1',
				choices: [
						{ id: '1', label: 'F1' },
						{ id: '2', label: 'F2' },
						{ id: '3', label: 'F3' },
						{ id: '4', label: 'F4' },
						{ id: '5', label: 'F5' },
						{ id: '6', label: 'F6' },
						{ id: '7', label: 'F7' },
						{ id: '8', label: 'F8' },
						{ id: '9', label: 'F9' },
						{ id: '10', label: 'F10' },
						{ id: '11', label: 'F11' },
						{ id: '12', label: 'F12' },
						{ id: '13', label: 'F13' },
						{ id: '14', label: 'F14' },
						{ id: '15', label: 'F15' },
						{ id: '16', label: 'F16' },
						{ id: '17', label: 'Shift + F1' },
						{ id: '18', label: 'Shift + F2' },
						{ id: '19', label: 'Shift + F3' },
						{ id: '20', label: 'Shift + F4' },
						{ id: '21', label: 'Shift + F5' },
						{ id: '22', label: 'Shift + F6' },
						{ id: '23', label: 'Shift + F7' },
						{ id: '24', label: 'Shift + F8' },
						{ id: '25', label: 'Shift + F9' },
						{ id: '26', label: 'Shift + F10' },
						{ id: '27', label: 'Shift + F11' },
						{ id: '28', label: 'Shift + F12' },
						{ id: '29', label: 'Shift + F13' },
						{ id: '30', label: 'Shift + F14' },
						{ id: '31', label: 'Shift + F15' },
						{ id: '32', label: 'Shift + F16' }
				],
				tooltip: 'Select macro'
			},{
				type: 'textinput',
				label: 'CON id',
				id: 'conid',
				default: '',
				tooltip: 'Enter CON ID for executing the macro',
				regex: Regex.NUMBER
			},{
				type: 'textinput',
				label: 'USER id',
				id: 'userid',
				default: '0',
				tooltip: 'Enter User ID for user macro or 0 for CON macro',
				regex: Regex.NUMBER
			}],
			callback: async function (action) {
				self.executeAction(action);
			}
		},

		'switch-link': {
			name: 'Switch Link of redundant CON',
			options: [{
				type: 'textinput',
				label: 'CON',
				id: 'con',
				default: '',
				tooltip: 'Enter CON Number',
				regex: Regex.NUMBER
			},{
				type: 'dropdown',
				label: 'Link',
				id: 'link',
				default: '1',
				choices: [
						{ id: '1', label: 'Link 1' },
						{ id: '2', label: 'Link 2' }
				],
				tooltip: 'Select Link of CON to become activated'
			}],
			callback: async function (action) {
				self.executeAction(action);
			},
		},

		'0x51': {
			name: 'Set Connection of CON Devices to CPU Devices',
			options: [{
				type: 'textinput',
				label: 'CON',
				id: 'con',
				default: '',
				tooltip: 'Enter CON Number',
				regex: Regex.NUMBER
			},{
				type: 'textinput',
				label: 'CPU',
				id: 'cpu',
				default: '',
				tooltip: 'Enter CPU Number',
				regex: Regex.NUMBER
			}],
			callback: async function (action) {
				self.executeAction(action);
			}
		}				
	}

	self.setActionDefinitions(actions);
}


module.exports.executeAction = function (action) {
    var self = this;
	var opt = action.options;
	var cmd;

	switch (action.actionId) {

		case 'set-extended-connection':
			var cmd = Buffer.from([0x1B, 0x5B, 0x62, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
			cmd.writeUInt16LE(parseInt(opt.cpu), 5);
			cmd.writeUInt16LE(parseInt(opt.con), 7);
			cmd.writeUInt16LE(parseInt(opt.mode), 9);
			self.log('debug', 'CMD set-extended-connection:  ' + cmd.toString('hex'));
		break;

		case 'set-multiscreen-ctrl':
			var cmd = Buffer.from([0x1B, 0x5B, 0x77, 0x0D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
			cmd.writeUInt16LE(parseInt(opt.ctrlid), 9);
			cmd.writeUInt16LE(parseInt(opt.mscid), 11);
			self.log('debug', 'CMD set-multiscreen-ctrl:  ' + cmd.toString('hex'));
		break;

		case 'login-user':
			var cmd = Buffer.from([0x1B, 0x5B, 0x65, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00]);
			cmd.writeUInt16LE(parseInt(opt.conid), 5);
			cmd.writeUInt16LE(parseInt(opt.userid), 7);
			self.log('debug', 'CMD login-user:  ' + cmd.toString('hex'));
		break;

		case 'exec-macro-at-con':
			var cmd = Buffer.from([0x1B, 0x5B, 0x6F, 0x0D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
			// Write macro id.
			cmd.writeUInt16LE(parseInt(opt.macro), 5);
			// Get and write user id.
			// This is the user where the macro is defined and started.
			var userid = parseInt(opt.userid);
			cmd.writeUInt16LE(userid, 7);
			// Define con byte depending on user id.
			// This is the CON where the macro is defined and started.
			if(userid == 0) {
				cmd.writeUInt16LE(parseInt(opt.conid), 9);
			}
			// Write con id at con byte 11 in every case.
			// This is the CON to be used for PUSH and GET commands.
			// I call it "context CON".
			cmd.writeUInt16LE(parseInt(opt.conid), 11);
			self.log('debug', 'CMD exec-macro-at-con:  ' + cmd.toString('hex'));
		break;

		case 'switch-link':
			var cmd = Buffer.from([0x1B, 0x5B, 0x66, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
			cmd.writeUInt16LE(parseInt(opt.con), 5);
			cmd.writeUInt16LE(parseInt(opt.link), 7);
			self.log('debug', 'CMD switch-link:  ' + cmd.toString('hex'));
		break;

		case '0x51':
			var cmd = Buffer.from([0x1B, 0x5B, 0x51, 0x0B, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);
			cmd.writeUInt16LE(parseInt(opt.cpu), 7);
			cmd.writeUInt16LE(parseInt(opt.con), 9);
			self.log('debug', 'CMD 0x51:  ' + cmd.toString('hex'));
		break;

		case 'send-message':

			var message = opt.msg
			var max_len = 62;
			if(message.length > max_len) {
				message = message.substring(0, max_len);
			}

			// Calculate command size.
			var sizeWithoutMessage = 27;
			var size = sizeWithoutMessage + message.length + 1;
		
            // Split option to digits.
            var stringDigits = opt.conids.split(',');
            var realDigits   = stringDigits.map(Number);
			for(idx in realDigits) {
				var conid = realDigits[idx]
			
				var cmd = Buffer.from(new Array(sizeWithoutMessage));

				// Command header
				cmd.writeUInt8(27, 0);
				cmd.writeUInt8(91, 1);
				cmd.writeUInt8(49, 2);

				// Size
				cmd.writeUInt16LE(size, 3);
				// CON id
				cmd.writeUInt16LE(conid, 5);
				// Row padding
				cmd.writeInt32LE(-128, 7)
				// Col padding
				cmd.writeInt32LE(-128, 11)
				// Foreground
				cmd.writeUInt32LE(12, 15)
				// Background
				cmd.writeUInt32LE(1, 19)
				// Time
				cmd.writeUInt32LE(parseInt(opt.time), 23)

				if (self.socket !== undefined) {
					// Send command without message.
					console.log(cmd);
					self.socket.send(cmd);

					// Send message and trailing null byte.
					self.socket.send(message);
					self.socket.send(Buffer.from([0x00]))
				}

				self.log('debug', 'CMD send-message:  ' + cmd.toString('hex'));
			}
		// All commands are already built.
		// We stop here.
		return;

    }
	

    if (cmd !== undefined) {
        if (self.socket !== undefined) {
			console.log(new Date().toISOString(), 'CMD'.padEnd(self.console_ident), cmd);
            self.socket.send(cmd)
        }
    }
}