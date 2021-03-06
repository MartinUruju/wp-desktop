'use strict';

/**
 * External Dependencies
 */
const portscanner = require( 'portscanner' );
const debug = require( 'debug' )( 'desktop:server' );

/**
 * Internal dependencies
 */
const Config = require( 'lib/config' );
const state = require( 'lib/state' );

function showFailure( app ) {
	const dialog = require( 'electron' ).dialog;

	dialog.showMessageBox( {
		type: 'warning',
		title: 'WordPress',
		message: 'Failed to start the app',
		detail: 'Sorry but we failed to start the app. Are you running another copy of it?',
		buttons: [ 'Quit' ]
	}, function() {
		app.quit();
	} );
}

function startServer( port, running_cb ) {
	var boot = require( 'boot' );
	var http = require( 'http' );
	var server = http.createServer( boot() );

	state.serverPort = port;

	debug( 'Server created, binding to ' + state.serverPort );

	server.listen( {
		port: state.serverPort,
		host: Config.server_host
	}, function() {
		debug( 'Server started, passing back to app' );
		running_cb();
	} );
}

module.exports = {
	start: function( app, running_cb ) {
		debug( 'Checking server port: ' + state.serverPort + ' on host ' + Config.server_host );

		portscanner.findAPortNotInUse( Config.server_port.min, Config.server_port.max, Config.server_host, function( error, port ) {
			if ( error ) {
				debug( 'Port check failed - ' + error );
				showFailure( app );
				return;
			}

			debug( 'Starting server' );
			startServer( port, running_cb );
		} );
	}
};
