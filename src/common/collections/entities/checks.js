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

// item is a ReactiveVar which contains the edited record
const _assert_data_itemrv = function( caller, data ){
    assert.ok( data, caller+' data required' );
    assert.ok( data.item, caller+' data.item required' );
    assert.ok( data.item instanceof ReactiveVar, caller+' data.item expected to be a ReactiveVar' );
}

Entities.checks.check_label = async function( value, data, opts ){
    _assert_data_itemrv( 'Entities.checks.check_label()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.label = value;
    }
    if( !value ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.WARNING,
            message: pwixI18n.label( I18N, 'entity.check.label_unset' )
        });
    }
};
