/*
 * pwix:tenants-manager/src/server/js/tenants-list.js
 */

import { Tenants } from '../../common/collections/tenants/index.js';

const self = TenantsManager.list;
let _byIds = {};

// initialization of both the array and the dictionary
Tenants.s.getRichEntities().then(( fetched ) => {
    fetched.map(( it ) => { _byIds[it._id] = it; })
    self._array.set( fetched );
});

// maintain when server functions are called
const _onUpsert = function( args ){
    _byIds[args.entity._id] = args.entity;
    self._array.set( Object.values( _byIds ));
}
const _onRemoved = function( args ){
    delete _byIds[args.id];
    self._array.set( Object.values( _byIds ));
};

TenantsManager.s.eventEmitter.on( 'tenant-upsert', _onUpsert );
TenantsManager.s.eventEmitter.on( 'tenant-delete', _onRemoved );
