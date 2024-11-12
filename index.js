const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')

const UpgradeScripts = require('./src/upgrades');

const actions = require('./src/actions.js')
const initAPI  = require('./src/api.js')
const configFields = require('./src/config.js')

/** 
 * Companion instance class for draco tera
 */
class dracotera extends InstanceBase {
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
		}

		if (this.socket) {
			this.socket.destroy();
			delete this.socket;
		}
	}
}

runEntrypoint(dracotera, UpgradeScripts);