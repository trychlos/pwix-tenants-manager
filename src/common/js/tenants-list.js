/*
 * pwix:tenants-manager/src/common/js/tenants-list.js
 *
 * Maintain in the TenantsManager global object the list of the tenants as a ReactiveVar which contains:
 * - an array of entities,
 * - each entity having a DYN.managers array and a DYN.records array
 *  all being raw data from Mongo.
 */

import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

TenantsManager.list = {
    collection: TenantsManager.collections.get( TenantsManager.C.pub.tenantsAll.collection ),
    handle: Meteor.isClient && Meteor.subscribe( TenantsManager.C.pub.tenantsAll.publish ),
    array: new ReactiveVar( [] ),

    // returns the entity document and its DYN arrays
    byEntity( entity ){
        const list = TenantsManager.list.array.get();
        let found = null;
        list.every(( it ) => {
            if( it._id === entity ){
                found = it;
            }
            return found === null;
        });
        return found;
    },

    // returns the list of closest ids
    getClosests(){
        const list = TenantsManager.list.array.get();
        let closests = [];
        list.forEach(( it ) => {
            closests.push( it.DYN.closest._id );
        });
        return closests;
    },

    // returns the list of entities as an array of ids
    getEntities(){
        const list = TenantsManager.list.array.get();
        let entities = [];
        list.forEach(( it ) => {
            entities.push( it._id );
        });
        return entities;
    }
};

// fill up and track and maintain the tenants array client side
if( Meteor.isClient ){
    Tracker.autorun(() => {
        if( TenantsManager.list.handle.ready()){
            let tenants = [];
            TenantsManager.list.collection.find().forEachAsync(( o ) => {
                tenants.push( o );
            }).then(() => {
                TenantsManager.list.array.set( tenants );
                console.debug( 'tenants', tenants );
            });
        }
    });
}

// fill up and track and maintain the tenants array server side
if( Meteor.isServer ){
    Tracker.autorun(() => {
        TenantsManager.list.collection.find().fetchAsync().then(( fetched ) => {
            console.debug( 'fetched', fetched );
        });
    });
}
