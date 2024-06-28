/*
 * pwix:tenants-manager/src/common/collections/records/checks.js
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;
import validator from 'email-validator';
import validUrl from 'valid-url';

import { pwixI18n } from 'meteor/pwix:i18n';
import { TM } from 'meteor/pwix:typed-message';

import { Entities } from '../entities/index.js';
import { Records } from './index.js';

Records.checks = {};

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

// returns the index of the identified row in the array
const _id2index = function( array, id ){
    for( let i=0 ; i<array.length ; ++i ){
        if( array[i].id === id ){
            return i;
        }
    }
    console.warn( 'id='+id+' not found' );
    return -1;
}

// contact email
//  must be valid if set
Records.checks.contactEmail = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.contactEmail()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.contactEmail = value;
    }
    if( value ){
        if( !validator.validate( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'check.contact_email_invalid' )
            });
        }
    }
    return null;
};

// contact page url
//  must be valid if set
Records.checks.contactUrl = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.contactUrl()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.contactUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'check.contact_url_invalid' )
            });
        }
    }
    return null;
};

// general terms o fuse page url
//  must be valid if set
Records.checks.gtuUrl = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.gtuUrl()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.gtuUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'check.gtu_url_invalid' )
            });
        }
    }
    return null;
};

// home page url
//  must be valid if set
Records.checks.homeUrl = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.homeUrl()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.homeUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'check.home_url_invalid' )
            });
        }
    }
    return null;
};

// the label must be set, and must identify the entity
Records.checks.label = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.label()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.label = value;
    }
    if( !value ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.label_unset' )
        });
    } else {
        const fn = function( result ){
            let ok = true;
            if( result.length ){
                // we have found an existing label
                //  this is normal if the found entity is the same than ours
                const found_entity = result[0].entity;
                ok = ( item.entity === found_entity );
            }
            return ok ? null : new TM.TypedMessage({
                type: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.label_exists' )
            });
        };
        const promise =
            Meteor.isClient ? Meteor.callAsync( 'pwix_tenants_manager_entities_getBy', { label: value }) : Entities.server.getBy({ label: value });
        return promise
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

// legal terms page url
//  must be valid if set
Records.checks.legalsUrl = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.legalsUrl()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.legalsUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'check.legals_url_invalid' )
            });
        }
    }
    return null;
};

// personal data management policy page url
//  must be valid if set
Records.checks.pdmpUrl = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.pdmpUrl()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.pdmpUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'check.pdmp_url_invalid' )
            });
        }
    }
    return null;
};

// support email
//  must be valid if set
Records.checks.supportEmail = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.supportEmail()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.supportEmail = value;
    }
    if( value ){
        if( !validator.validate( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'check.support_email_invalid' )
            });
        }
    }
    return null;
};

// support page url
//  must be valid if set
Records.checks.supportUrl = async function( value, data, opts ){
    _assert_data_itemrv( 'Records.checks.supportUrl()', data );
    let item = data.item.get();
    if( opts.update !== false ){
        item.supportUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'check.support_url_invalid' )
            });
        }
    }
    return null;
};
