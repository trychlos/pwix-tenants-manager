/*
 * pwix:tenants-manager/src/common/collections/tenants/server/publish.js
 */

import { Tenants } from '../index.js';

// returns a cursor of all accounts
// Publish function can only return a Cursor or an array of Cursors
Meteor.publish( 'tenants.listAll', function(){
    return Tenants.find();
});
