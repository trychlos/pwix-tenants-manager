/*
 * pwix:tenants-manager/src/common/collections/records/server/functions.js
 *
 * Server-only functions
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;

import { check } from 'meteor/check';

import { Records } from '../index.js';

Records.server = {};

/*
 * @param {Object} selector
 * @param {String} userId
 * @returns {Array} may be empty
 */
Records.server.getBy = async function( selector, userId ){
    check( selector, Object );
    if( userId ){
        check( userId, String );
        if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.records.fn.get_by', userId, selector )){
            return null;
        }
    }
    const res = await Records.collection.find( selector ).fetchAsync();
    //console.debug( 'records', selector, res );
    return res;
};

/*
 * @summary Create/Update at once an entity and all its validity records
 * @param {Object} entity
 *  an object with a DYN.records array of validity records as ReactiveVar's
 *  we have made sure that even a new entity has its identifier
 *  (but records have not in this case at the moment)
 * @param {String} userId
 * @returns {Object} with following keys:
 */
Records.server.upsert = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.records.fn.upsert', userId, entity )){
        return null;
    }
    //console.debug( 'Records.server.upsert()', entity );
    // get the original item records to be able to detect modifications
    //  and build a hash of id -> record
    const orig = await Records.server.getBy({ entity: entity._id }, userId );
    let origIds = {};
    orig.map(( it ) => { origIds[it._id] = it; });
    let leftIds = _.cloneDeep( origIds );
    let updatableIds = {};
    // prepare the result
    let result = {
        orig: orig,
        inserted: 0,
        updated: 0,
        written: [],
        unchanged: [],
        removed: 0,
        count: 0
    };
    // for each provided item, test against the original (if any)
    //  BAD HACK CAUTION: the client has sent (it is expected the client has...) DYN.records as an array of ReactiveVar's
    //  but the class didn't survive the DDP transfert to the server - and so we get here the data members of the class without the functions
    //  so the 'curValue' below
    for( let i=0 ; i<entity.DYN.records.length ; ++i ){
        let record = entity.DYN.records[i].curValue;
        // remove from leftIds the found record
        if( leftIds[record._id] ){
            delete leftIds[record._id];
        }
        // compare and see if the record is to be updated
        if( _.isEqual( record, origIds[record._id] )){
            result.unchanged.push( record );
        } else {
            updatableIds[record._id] = record;
        }
    }
    // for each updatable, then... upsert!
    // as of 2024- 7-17 and matb33:collection-hooks v 2.0.0-rc.1 there is not yet any hook for async methods (though this work at creation)
    let promises = [];
    Object.keys( updatableIds ).forEach(( id ) => {
        const record = updatableIds[id];
        if( record._id ){
            record.updatedBy = userId;
            record.updatedAt = new Date();
        }
        record.entity = entity._id;
        promises.push( Records.collection.upsertAsync({ _id: record._id }, { $set: record }).then(( res ) => {
            //console.debug( 'upsert item', item, 'res', res );
            if( res.numberAffected > 0 ){
                if( item._id ){
                    result.updated += 1;
                } else if( res.insertedId ){
                    result.inserted += 1;
                }
                result.written.push( record );
            }
            return res;
        }));
    });
    // and remove the left items (removed validity periods)
    Object.keys( leftIds ).forEach(( id ) => {
        promises.push( Records.collection.removeAsync({ _id: id }).then(( res ) => {
            result.removed += res || 0;
            return res;
        }));
    });
    return Promise.allSettled( promises ).then(() => {
        return Records.collection.countDocuments({ entity: entity._id });
    }).then(() => {
        console.debug( 'Records result', result );
        return result;
    });
};
