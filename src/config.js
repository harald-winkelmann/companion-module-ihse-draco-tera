const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module is for IHSE Draco KVM matrix connection'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Matrix IP(s) (comma separated)',
				width: 12,
				default: '192.168.100.99',
				regex: 
// Don't change these lines.
// No ident is allowed here.
// We splitted the regular expression over several lines to make it easier to understand.
"\
/\
^\
(\
(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\
,)*\
(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\
$\
/"
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Matrix Port',
				width: 12,
				default: '5555',
				regex: Regex.PORT
			},

			{
				type: 'textinput',
				id: 'ibc_con_ids',
				label: 'IBC 2024 CON ID(s) (comma separated)',
				width: 12,
				default: '',
				regex: 
// Don't change these lines.
// No ident is allowed here.
// We splitted the regular expression over several lines to make it easier to understand.
"\
/\
^\
(\
(([0-9]){1,4})\
,)*\
(([0-9]){1,4})\
$\
/"
			},

		]
	},
}