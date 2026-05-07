/**
 * This entry point starts both the Parent and Child servers for the IFrame Security Demo.
 *
 * Parent: http://localhost:3000
 * Child: http://localhost:4000
 */

console.log('Starting IFrame Security Demo...');

// Start Parent Server
require('./ParentServer/index.js');

// Start Child Server
require('./ChildServer/index.js');
