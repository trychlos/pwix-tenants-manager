/*
 * pwix:tenants-manager/src/server/js/tenants-list.js
 */

import { Logger } from 'meteor/pwix:logger';

import { Tenants } from '../../common/collections/tenants/index.js';
import { setDataReady } from '../../common/js/data-ready.js';

const logger = Logger.get();
const self = TenantsManager.list;
let _byIds = {};
let _initialLoadComplete = false;
let _pendingChanges = [];

// initialization of both the array and the dictionary
Tenants.s.getTransformedEntities().then(( fetched ) => {
    const byIds = {};
    fetched.forEach(( it ) => { byIds[it._id] = it; });
    _pendingChanges.forEach(( change ) => {
        if( change.type === 'upsert' ){
            byIds[change.entity._id] = change.entity;
        } else {
            delete byIds[change.id];
        }
    });
    _byIds = byIds;
    _pendingChanges = [];
    _initialLoadComplete = true;
    self._array.set( Object.values( _byIds ));
    logger.debug( `setting tenants list (${Object.keys( _byIds ).length})` );
    setDataReady( true );
}).catch(( error ) => {
    logger.error( 'unable to initialize the tenant list', error );
    setDataReady( false );
});

// maintain when server functions are called
const _onUpsert = function( args ){
    _byIds[args.entity._id] = args.entity;
    if( !_initialLoadComplete ){
        _pendingChanges.push({ type: 'upsert', entity: args.entity });
    } else {
        self._array.set( Object.values( _byIds ));
    }
}
const _onRemoved = function( args ){
    delete _byIds[args.id];
    if( !_initialLoadComplete ){
        _pendingChanges.push({ type: 'remove', id: args.id });
    } else {
        self._array.set( Object.values( _byIds ));
    }
};

TenantsManager.s.eventEmitter.on( 'tenant-upsert', _onUpsert );
TenantsManager.s.eventEmitter.on( 'tenant-delete', _onRemoved );
