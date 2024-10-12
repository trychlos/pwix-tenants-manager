/*
 * pwix:tenants-manager/src/client/js/tenants-list.js
 *
 * Maintain the list of the tenants as a ReactiveVar which contains:
 * - an array of entities,
 * - each entity having its DYN sub-object with DYN.managers and DYN.records arrays
 */

import { Tracker } from 'meteor/tracker';

const self = TenantsManager.list;

// client-side: subscribe to the tenantsAll publication at initialization time
let _handle = Meteor.subscribe( TenantsManager.C.pub.tenantsAll.publish );

Tracker.autorun(() => {
    if( _handle.ready()){
        TenantsManager.collections.get( TenantsManager.C.pub.tenantsAll.collection ).find().fetchAsync().then(( fetched ) => {
            self._array.set( fetched );
            console.debug( 'tenants', fetched );
        });
    }
});
