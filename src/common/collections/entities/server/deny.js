/*
 * pwix:tenants-manager/src/common/collections/entities/server/deny.js
 */

import { Tracker } from 'meteor/tracker';

import { Entities } from '../index.js';

// Deny all client-side updates
// cf. https://guide.meteor.com/security.html#allow-deny
// see also https://docs.meteor.com/api/accounts.html#Meteor-users

Tracker.autorun(() => {
    if( Entities.collectionReady.get()){
        Entities.collection.deny({
            insert(){ return true; },
            update(){ return true; },
            remove(){ return true; },
        });
    }
});
