/*
 * pwix:tenants-manager/src/common/collections/entities/checks.js
 */

const assert = require( 'assert' ).strict;

import { pwixI18n } from 'meteor/pwix:i18n';
import { TM } from 'meteor/pwix:typed-message';

import { Entities } from './index.js';

Entities.checks = {};

// fields check
//  - value: mandatory, the value to be tested
//  - data: optional, the data passed to Checker instanciation
//    if set the target item as a ReactiveVar, i.e. the item to be updated with this value
//  - opts: an optional behaviour options, with following keys:
//    > update: whether the item be updated with the value, defaults to true
//    > id: the identifier of the edited row when editing an array
// returns a TypedMessage, or an array of TypedMessage, or null

// item is a ReactiveVar which contains the edited document
const _assert_data_itemrv = function( caller, data ){
    assert.ok( data, caller+' data required' );
    assert.ok( data.item, caller+' data.item required' );
    assert.ok( data.item instanceof ReactiveVar, caller+' data.item expected to be a ReactiveVar' );
}

// the label must be set, and unique among any entities and any records
Entities.checks.check_label = async function( value, data, opts ){
    _assert_data_itemrv( 'Entities.checks.check_label()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.label = value;
    }
    if( !value ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'entities.check.label_unset' )
        });
    } else {
        const fn = function( result ){
            console.debug( 'result', result );
            let ok = false;
            if( result.length ){
                // we have found an existing label
                //  this is normal if the found entity is the same than ours
                const found_entity = result[0].entity;
                if( item.entity === found_entity ){
                    ok = true;
                }
            } else {
                ok = true;
            }
            return ok ? null : new TM.TypedMessage({
                type: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'entities.check.label_exists' )
            });
        };
        const promise =
            Meteor.isClient ? Meteor.callAsync( 'pwix_tenants_manager_entities_getBy', { label: value }) : Entities.server.getBy({ label: value });
        promise
            .then(( result ) => {
                if( result ){
                    return result;
                } else {
                    return Meteor.isClient ? Meteor.callAsync( 'pwix_tenants_manager_records_getBy', { label: value }) : Records.server.getBy({ label: value });
                }
            })
            .then(( result ) => {
                return fn( result );
            });
    }
};
