/*
 * pwix:tenants-manager/src/common/collections/entities/server/functions.js
 *
 * Server-only functions
 */

import _ from 'lodash';

import { check } from 'meteor/check';

import { Entities } from '../index.js';

Entities.s = {};

/**
 * @summary Make sure all the fields of the fieldset are set in the item, even if undefined
 * @param {Object} item
 * @returns {Object} item
 */
Entities.s.addUndef = function( item ){
    Entities.fieldSet.get().names().forEach(( it ) => {
        if( !Object.keys( item ).includes( it )){
            item[it] = undefined;
        }
    });
    return item;
};

/*
 * @param {Object} selector
 * @param {String} userId
 * @returns {Array} may be empty, or null in case of an error
 */
Entities.s.getBy = async function( selector, userId ){
    check( selector, Object );
    if( userId ){
        check( userId, String );
        if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.entities.fn.get_by', userId, selector )){
            return null;
        }
    }
    const res = await Entities.collection.find( selector ).fetchAsync();
    //console.debug( 'entitites', selector, res );
    return res;
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
Entities.s.upsert = async function( entity, userId ){
    check( entity, Object );
    check( userId, String );
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.entities.fn.upsert', userId, entity )){
        return null;
    }
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
        // Error: After filtering out keys not in the schema, your modifier is now empty
        //  this is normal as long as we do not set any data in the document
        //  so at least set updatedAt here (and even if this will be set another time by timestampable behaviour)
        //item.updatedBy = userId;
        result.numberAfftected = await Entities.collection.updateAsync( selector, { $set: item }, { filter: false });
    } else {
        result.insertedId = await Entities.collection.insertAsync( item );
        result.numberAffected = 1;
        entity._id = result.insertedId;
    }
    //console.debug( 'Entities result', result );
    return result;
};
