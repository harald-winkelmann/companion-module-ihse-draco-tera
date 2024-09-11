const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const axios = require('axios');

const UpgradeScripts = require('./src/upgrades');

const actions = require('./src/actions.js')
const initAPI  = require('./src/api.js')
const configFields = require('./src/config.js')

/** 
 * Companion instance class for draco tera
 */
class dracotera extends InstanceBase {
	constructor(internal) {
		super(internal)
		Object.assign(this, {
			...configFields,
			...actions,
			...initAPI,
			}
		)

		this.KEEPALIVE = null;
	}

	// Init module
	async init(config) {
		this.updateStatus(InstanceStatus.Connecting);
		this.configUpdated(config);
	}

	// Configuration changed
	async configUpdated(config) {
		if (config) {
			this.config = config;
		}

		this.initActions();
		this.initAPI();
	}

	// Instance removal clean up
	destroy() {
		if(this.KEEPALIVE) {
			clearInterval(this.KEEPALIVE)
			delete this.KEEPALIVE;
		}

		if (this.socket) {
			this.socket.destroy();
			delete this.socket;
		}
	}

	async callApi(userid) {
		var username = '---';
		var logout = 'Logged\nout';
		if(userid > 0) {
			username = 'User ID\n' + userid;
			logout = 'Logout\nUser ID\n' + userid;
		}
		
        const body = JSON.parse('{}');

		var companion = '127.0.0.1';
		//var companion = '192.168.221.35';

		const url = 'http://' + companion + ':8000/api/location/1/0/4/style?text=' + username;
        try {
          const response = await axios.post(url, body, {
            headers: {
              'accept' : '*/*'
            }
          });
          console.log('Response:', response.data);
        } catch (error) {
          console.error('Error:', error.message);
        }


		const url2 = 'http://' + companion + ':8000/api/location/1/0/5/style?text=' + logout;
		try {
			const response = await axios.post(url2, body, {
				headers: {
				'accept' : '*/*'
				}
			});
			console.log('Response:', response.data);
		} catch (error) {
			console.error('Error:', error.message);
		}


	}

}

runEntrypoint(dracotera, UpgradeScripts);