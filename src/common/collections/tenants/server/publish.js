/*
 * pwix:tenants-manager/src/common/collections/tenants/server/publish.js
 */

// returns a cursor of all accounts
// Publish function can only return a Cursor or an array of Cursors
Meteor.publish( 'accounts.listAll', function(){
    return Meteor.users.find();
});
