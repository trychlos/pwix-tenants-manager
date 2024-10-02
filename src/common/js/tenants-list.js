/*
 * pwix:tenants-manager/src/common/js/tenants-list.js
 *
 * Maintain the list of the tenants as a ReactiveVar which contains:
 * - an array of entities,
 * - each entity having its DYN sub-object with DYN.managers and DYN.records arrays
 * 
 * Client side maintains a tracker on a tenant_all publication, so both client and server sides have the tools to update this central registration.
 * NB: 'central' here doesn't mean that the same instance is shared between client and server sides! That means that both instances are maintained equal.
 */

import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

TenantsManager.list = {
    _handle: null,
    _array: new ReactiveVar( [] ),
    _byIds: {},


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
        return TenantsManager.list._array.get();
    }
};

const self = TenantsManager.list;

// client-side: subscribe to the tenantsAll publication at initialization time
if( Meteor.isClient ){
    self._handle = Meteor.subscribe( TenantsManager.C.pub.tenantsAll.publish );
    Tracker.autorun(() => {
        if( self._handle.ready()){
            TenantsManager.collections.get( TenantsManager.C.pub.tenantsAll.collection ).find().fetchAsync().then(( fetched ) => {
                self._array.set( fetched );
                console.debug( 'tenants', fetched );
            });
        }
    });
}

// server-side: this very same publication is used to maintain the list (thanks to Mongo observers)
if( Meteor.isServer ){
    // when the list has been updated, make sure we have ClientsRegistrar and IdentitiesRegistrar
    const _serverUpdate = function(){
        self._array.set( Object.values( self._byIds ));
        self.get().forEach(( it ) => {
            if( TenantsManager.s?.eventEmitter ){
                TenantsManager.s.eventEmitter.emit( 'item-update', it );
            }
        });
    }
    const _onAdded = function( id, organization ){
        self._byIds[id] = organization;
        _serverUpdate();
    };
    const _onChanged = _onAdded;
    const _onRemoved = function( id, organization ){
        delete self._byIds[id];
        _serverUpdate();
    };
    TenantsManager.s.eventEmitter.on( 'added', _onAdded );
    TenantsManager.s.eventEmitter.on( 'changed', _onChanged );
    TenantsManager.s.eventEmitter.on( 'removed', _onRemoved );
}
