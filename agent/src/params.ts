const {argv} = require('yargs');

export const port = argv.port || 3001;
export const server_port = argv.server_port || 3000;
export const server_host = argv.server_host || 'localhost';
export const server_protocol = argv.server_protocol || 'http';
export const server_url = `${server_protocol}://${server_host}:${server_port}`;
