/*
 * pwix:tenants-manager/src/common/collections/entities/server/functions.js
 *
 * Server-only functions
 */

import _ from 'lodash';

import { check } from 'meteor/check';

import { Entities } from '../index.js';

Entities.server = {};

/*
 * @param {Object} selector
 * @param {String} userId
 * @returns {Array} may be empty
 */
Entities.server.getBy = async function( selector, userId ){
    check( selector, Object );
    check( userId, String );
    return await Entities.collection.find( selector ).fetchAsync();
};

/*
 * @summary Create/Update at once an entity and all its validity records
 * @param {Object} entity
 *  an object with a DYN.records array of validity records as ReactiveVar's
 * @param {String} userId
 * @returns {Object} with following keys:
 *  - numberAffected
 *  - insertedId, if the entity was just newly inserted
 *  - orig, the value before upsert
 */
Entities.server.upsert = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    let result = {
        orig: null
    };
    let selector = {};
    let item = _.cloneDeep( entity );
    delete item.DYN;
    delete item._id;
    //console.debug( 'item', item );
    // tries to work around "Error: Failed validation Upsert failed after 3 tries."
    if( entity._id ){
        result.orig = await Entities.collection.findOneAsync({ _id: entity._id });
        selector = { _id: entity._id };
        //console.debug( 'selector', selector );
        result.numberAfftected = await Entities.collection.updateAsync( selector, { $set: item });
    } else {
        result.insertedId = await Entities.collection.insertAsync( item );
        result.numberAfftected = 1;
        entity._id = result.insertedId;
    }
    console.debug( 'Entities result', result );
    return result;
};
