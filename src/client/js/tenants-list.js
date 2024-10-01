/*
 * pwix:tenants-manager/src/client/js/tenants-list.js
 *
 * Maintain in the client side of the TenantsManager global object the list of the tenants as a ReactiveVar which contains:
 * - an array of entities,
 * - each entity having a DYN.managers documents array and a DYN.records documents array
 */

import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

TenantsManager.list = {
    handle: Meteor.subscribe( TenantsManager.C.pub.tenantsAll.publish ),
    array: new ReactiveVar( [] ),

    // returns the entity document and its DYN arrays
    byEntity( entity ){
        const list = TenantsManager.list.get();
        let found = null;
        list.every(( it ) => {
            if( it._id === entity ){
                found = it;
            }
            return found === null;
        });
        return found;
    },

    // returns the list content
    get(){
        return TenantsManager.list.array.get();
    }
};

// fill up and track and maintain the tenants array
Tracker.autorun(() => {
    if( TenantsManager.list.handle.ready()){
        TenantsManager.collections.get( TenantsManager.C.pub.tenantsAll.collection ).find().fetchAsync().then(( fetched ) => {
            TenantsManager.list.array.set( fetched );
            console.debug( 'tenants', fetched );
        });
    }
});
