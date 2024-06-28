/*
 * pwix:tenants-manager/src/common/collections/tenants/server/functions.js
 *
 * Server-only functions
 */

import _ from 'lodash';

import { check } from 'meteor/check';

import { Tenants } from '../index.js';

import { Entities } from '../../entities/index.js';
import { Records } from '../../records/index.js';

Tenants.server = {};

/*
 * @param {Object} entity
 *  an object with a DYN.managers array
 * @param {String} userId
 */
Tenants.server.setManagers = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
};


/*
 * remove null and undefined values from the object
 * @returns {Object} a hash of fields to unset
 */
Tenants.server.removeUnsetValues = function( item ){
    let unset = {};
    let tobeRemoved = [];
    Object.keys( item ).every(( field ) => {
        if( _.isNil( item[field] )){
            tobeRemoved.push( field );
        }
        return true;
    });
    tobeRemoved.every(( field ) => {
        unset[field] = 1;
        delete item[field];
        //console.debug( 'deleting', field );
        return true;
    });
    return unset;
};

/*
 * @summary Create/Update at once an entity and all its validity records
 * @param {Object} entity
 *  an object with a DYN.records array of validity records as ReactiveVar's
 * @param {String} userId
 * @returns {Object}
 */
Tenants.server.upsert = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    //console.debug( 'Tenants.server.upsert()', entity );

    // upsert the entity
    //  we get back not only a result but also the original entity
    //  when new, 'entity' has been updated with newly inserted id
    let entitiesRes = await Entities.server.upsert( entity, userId );

    // and asks the Records to do the rest
    let recordsRes = await Records.server.upsert( entity, userId );

    return {
        entities: entitiesRes,
        records: recordsRes
    }
};
