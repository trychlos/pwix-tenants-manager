/*
 * pwix:tenants-manager/src/common/js/tenants-list.js
 *
 * Maintain the list of the tenants as a ReactiveVar which contains:
 * - an array of entities,
 * - each entity having its DYN sub-object with DYN.managers and DYN.records arrays (of ReactiveVar's on the client)
 * 
 * Client side maintains a tracker on a tenant_all publication, so both client and server sides have the tools to update this central registration.
 * 
 * NB: 'central' here doesn't mean that the same instance is shared between client and server sides! That means that both instances are maintained equal.
 */

import { ReactiveVar } from 'meteor/reactive-var';

TenantsManager.list = {
    _array: new ReactiveVar( [] ),
    _warned: {},

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
        if( !found && !TenantsManager.list._warned[entity] ){
            TenantsManager.list._warned[entity] = true,
            console.warn( 'unable to find tenant by entity', entity );
        }
        return found;
    },

    // returns the list content
    get(){
        return TenantsManager.list._array.get();
    }
};
