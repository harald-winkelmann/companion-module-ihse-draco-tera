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
	COMPANION_IP = '127.0.0.1';
	COMPANION_PORT = '8000';

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

		var url = 'http://' + this.COMPANION_IP + ':' + this.COMPANION_PORT + '/api/location/1/0/4/style?text=' + username;
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


		url = 'http://' + this.COMPANION_IP + ':' + this.COMPANION_PORT + '/api/location/1/0/5/style?text=' + logout;
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
	}

	async getVariable(variableId) {
		// Regular expression for getting custom variable name out of 
		// allowed variable definition.
		// The API command below only works for custom variables!
		var regex = new RegExp("^(\\$\\((internal:custom_)(.*)\\))$");
		var match  = variableId.match(regex);
		var id = null;
		if (match) {
			id = match[3];
		}

		if(id) {					
			const body = JSON.parse('{}');
			const url = 'http://' + this.COMPANION_IP + ':' + this.COMPANION_PORT + '/api/custom-variable/' + id + '/value';
			try {
				const response = await axios.get(url, body, {
					headers: {
					'accept' : '*/*'
					}
				});
				return response.data;
				
			} catch (error) {
				console.error('Error:', error.message);
				return null;
			}
		}
		else {
			console.log('Error - Invalid variable definition:', variableId)
			return null;
		}
	}
}

runEntrypoint(dracotera, UpgradeScripts);