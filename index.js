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
	COMPANION_IP 	= '127.0.0.1';
	COMPANION_PORT 	= '8000';
	HEADERS 		= {headers: {'accept' : '*/*'}};
	KEEPALIVE_TMR	= 25000; // Milliseconds

	// Regular expression for getting custom variable name out of 
	// allowed variable definition.
	CUSTOM_VAR_REGEX= new RegExp("^(\\$\\((internal:custom_)(.*)\\))$");

	// Identation for some console outputs.
	console_ident = 5;

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
			this.log('error','keep alive stopped');
		}

		if (this.socket) {
			this.socket.destroy();
			this.log('error','socked destroyed');
			delete this.socket;
			this.log('error','socked deleted');
		}
	}

	async setCompanionText(text, page, row, column, color, bgcolor, size) {
		var url = `http://${this.COMPANION_IP}:${this.COMPANION_PORT}/api/location/${page}/${row}/${column}/style`;

		const body = JSON.parse('{}');
		
		body["text"] = text;
		if(color) {
			body["color"] = color;
		}
		if(bgcolor) {
			body["bgcolor"] = bgcolor;
		}
		if(size) {
			body["size"] = size;
		}

		this.doCompanionApiPostCall(url, body);
	}

	async doCompanionApiPostCall(url, body) {
        try {
          	const response = await axios.post(url, body, this.HEADERS);
        } catch (error) {
          	console.error('Error:', error.message);
          	console.error('  URL:', url);
        }
	}

	async getCompanionVariable(variableId) {
		// The API command below only works for custom variables!
		var match  = variableId.match(this.CUSTOM_VAR_REGEX);
		var id = null;
		if (match) {
			id = match[3];
		}

		if(id) {					
			const body = JSON.parse('{}');
			const url = 'http://' + this.COMPANION_IP + ':' + this.COMPANION_PORT + '/api/custom-variable/' + id + '/value';
			try {
				const response = await axios.get(url, body, this.HEADERS);
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

	async setCompanionVariable(variableId, variableValue) {
		// The API command below only works for custom variables!
		var match  = variableId.match(this.CUSTOM_VAR_REGEX);
		var id = null;
		if (match) {
			id = match[3];
		}

		if(id) {					
			const body = JSON.parse('{}');
			const url = 'http://' + this.COMPANION_IP + ':' + this.COMPANION_PORT + '/api/custom-variable/' + id + '/value?value=' + variableValue;
			this.doCompanionApiPostCall(url, body);		}
		else {
			console.log('Error - Invalid variable definition:', variableId)
			return null;
		}
	}
}

runEntrypoint(dracotera, UpgradeScripts);