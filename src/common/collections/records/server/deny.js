/*
 * pwix:tenants-manager/src/common/collections/records/server/deny.js
 */

import { Tracker } from 'meteor/tracker';

import { Records } from '../index.js';

// Deny all client-side updates
// cf. https://guide.meteor.com/security.html#allow-deny
// see also https://docs.meteor.com/api/accounts.html#Meteor-users

Tracker.autorun(() => {
    if( Records.collectionReady.get()){
        Records.collection.deny({
            insert(){ return true; },
            update(){ return true; },
            remove(){ return true; },
        });
    }
});
