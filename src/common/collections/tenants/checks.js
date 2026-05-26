/*
 * pwix:tenants-manager/src/common/collections/tenants/checks.js
 *
 * Note: do NOT import Entities nor Records here to prevent any import error (best to leave tenants be fully evaluated before trying to import Entities or Records)
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;
import validator from 'email-validator';
import validUrl from 'valid-url';

import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { TM } from 'meteor/pwix:typed-message';

import { Tenants } from './index.js';

const logger = Logger.get();

Tenants.checks = {};

// fields check
//  - value: mandatory, the value to be tested
//  - data: optional, the data passed to Checker instanciation
//    if set the target item as a ReactiveVar, i.e. the item to be updated with this value
//  - opts: an optional behaviour options, with following keys:
//    > update: whether the item be updated with the value, defaults to true
//    > id: the identifier of the edited row when editing an array
// returns a TypedMessage, or an array of TypedMessage, or null

// entity is a ReactiveVar which contains the edited entity document and its validity records
const _assert_data_content = function( caller, data ){
    assert.ok( data, caller+' data is required' );
    assert.ok( data.entity && data.entity instanceof ReactiveVar, caller+' data.entity is expected to be set as a ReactiveVar, got '+data.entity );
    const entity = data.entity.get();
    assert.ok( entity.DYN && _.isObject( entity.DYN ), caller+' data.entity.DYN is expected to be set as a Object, got '+entity.DYN );
    assert.ok( entity.DYN.records && _.isArray( entity.DYN.records ), caller+' data.entity.DYN.records is expected to be set as an Array, got '+entity.DYN.records );
    entity.DYN.records.forEach(( it ) => {
        assert.ok( it && it instanceof ReactiveVar, caller+' each record is expected to be a ReactiveVar, got '+it );
    });
    // this index because we are managing valdiity periods here
    assert.ok( _.isNumber( data.index ) && data.index >= 0, caller+' data.index is expected to be a positive or zero integer, got '+data.index );
}

// returns the index of the identified row in the array
const _id2index = function( array, id ){
    for( let i=0 ; i<array.length ; ++i ){
        if( array[i]._id === id ){
            return i;
        }
    }
    logger.warn( 'id='+id+' not found' );
    return -1;
}

// cross check an email row
//  we want both label+email - and refuse empty lines
Tenants.checks.crossCheck_EmailRow = async function( data, opts ){
    _assert_data_content( 'Tenants.checks.email_row()', data );
    //logger.debug( 'email_row()', arguments );
    let item = data.entity.get().DYN.records[data.index].get();
    let index = opts.rowId ? _id2index( item.emails, opts.rowId ) : -1;
    if( index < 0 ){
        logger.error( 'email_row() negative index', data, opts );
        return null;
    }
    const row = item.emails[index];
    //logger.debug( 'row', row, 'index', index );
    if( row.label && row.email ){
        return null;
    }
    if( row.label ){
        return new TM.TypedMessage({
            level: tmCount ? TM.MessageLevel.C.ERROR : TM.MessageLevel.C.WARNING,
            message: pwixI18n.label( I18N, 'records.check.emails_email_missing' )
        });
    }
    return new TM.TypedMessage({
        level: tmCount ? TM.MessageLevel.C.ERROR : TM.MessageLevel.C.WARNING,
        message: pwixI18n.label( I18N, 'records.check.emails_label_missing' )
    });
};

// check that we have at least one email address
Tenants.checks.crossCheck_Emails = async function( data, opts ){
    _assert_data_content( 'Tenants.checks.crossCheck_Emails()', data );
    // first is to check the configuration
    const conf = TenantsManager.configure();
    if( !conf.withDedicatedEmails && !conf.withGeneralizedEmails ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.emails_neither_dedicated_generalized' )
        });
    }
    // want make sure we have at least one email address
    const item = data.entity.get().DYN.records[data.index].get();
    if( conf.withDedicatedEmails && item.contactEmail ){
        return null;
    }
    if( conf.withGeneralizedEmails ){
        if( item.emails?.length ){
            for( const row of item.emails ){
                opts.rowId = row._id;
                const res = Tenants.checks.crossCheck_EmailRow( data, opts );
                if( res ){
                    return res;
                }
            }
        } else {
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.emails_wants_one' )
            });
        }
    }
};

// cross check the properties panel
//  have label, emails, urls, logo
Tenants.checks.crossCheck_Properties = async function( data, opts ){
    _assert_data_content( 'Tenants.checks.crossCheck_Properties()', data );
    let res = null;
    // want make sure we have at least one email address
    if( !res ){
        res = await Tenants.checks.crossCheck_Emails( data, opts );
    }
    // also cross checks the urls
    if( !res ){
        res = await Tenants.checks.crossCheck_Urls( data, opts );
    }
    return res;
};

// cross check an url row
//  we want both label+url, or refuse - do not want an empty line
Tenants.checks.crossCheck_UrlRow = async function( data, opts ){
    _assert_data_content( 'Tenants.checks.crossCheck_UrlRow()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    let index = opts.rowId ? _id2index( item.urls, opts.rowId ) : -1;
    if( index < 0 ){
        logger.error( 'crossCheck_UrlRow() negative index', data, opts );
        return null;
    }
    const row = item.urls[index];
    if( row.label && row.url ){
        return null;
    }
    if( row.label ){
        return new TM.TypedMessage({
            level: index ? TM.MessageLevel.C.WARNING : TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.urls_url_missing' )
        });
    }
    return new TM.TypedMessage({
        level: index ? TM.MessageLevel.C.WARNING : TM.MessageLevel.C.ERROR,
        message: pwixI18n.label( I18N, 'records.check.urls_label_missing' )
    });
};

// check ?
Tenants.checks.crossCheck_Urls = async function( data, opts ){
    _assert_data_content( 'Tenants.checks.crossCheck_Urls()', data );
    const item = data.entity.get().DYN.records[data.index].get();
    if( item.urls?.lengh ){
        for( const row of item.urls ){
            opts.rowId = row._id;
            const res = Tenants.checks.crossCheck_UrlRow( data, opts );
            if( res ){
                return res;
            }
        }
    }
    return null;
};

// contact email
//  must be valid if set
//  to know if it is mandatory, we examine the field declaration
Tenants.checks.contactEmail = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.contactEmail()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.contactEmail = value;
        data.entity.get().DYN.records[data.index].set( item );
    }
    if( value ){
        if( !validator.validate( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.contact_email_invalid' )
            });
        }
    }
    let mandatory = false; // which is the default
    const fieldset = TenantsManager.Records.fieldSet.get();
    if( fieldset ){
        const field = fieldset.byName( 'contactEmail' );
        if( field ){
            const def = field.def();
            if( def.form_type === Forms.FieldType.C.MANDATORY ){
                mandatory = true;
            }
        }
    }
    if( mandatory && !value ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.contact_email_unset' )
        });
    }
    return null;
};

// an email among others
//  must be valid if set
// wants at least one email address
Tenants.checks.email_email = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.email_email()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    let index = opts.rowId ? _id2index( item.emails, opts.rowId ) : -1;
    if( index < 0 ){
        logger.error( 'email_email() negative index', value, data, opts );
        return null;
    }
    if( opts.update !== false ){
        item.emails[index].email = value;
        data.entity.get().DYN.records[data.index].set( item );
    }
    if( value ){
        if( validator.validate( value )){
            return null;
        }
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.emails_email_invalid' )
        });
    }
    return new TM.TypedMessage({
        level: TM.MessageLevel.C.ERROR,
        message: pwixI18n.label( I18N, 'records.check.emails_email_missing' )
    });
};

// an email among others
//  opts must have a rowId
//  label is free but mandatory
Tenants.checks.email_label = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.email_label()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    let index = opts.rowId ? _id2index( item.emails, opts.rowId ) : -1;
    if( index < 0 ){
        logger.error( 'email_label() negative index', value, data, opts );
        return null;
    }
    if( opts.update !== false ){
        item.emails[index].label = value;
        data.entity.get().DYN.records[data.index].set( item );
    }
    if( value ){
        return null;
    }
    return new TM.TypedMessage({
        level: TM.MessageLevel.C.ERROR,
        message: pwixI18n.label( I18N, 'records.check.emails_label_missing' )
    });
};

// home page url
//  must be valid if set
Tenants.checks.homeUrl = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.homeUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.homeUrl = value;
        data.entity.get().DYN.records[data.index].set( item );
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.home_url_invalid' )
            });
        }
    }
    return null;
};

// the label must be set, and must identify the entity
Tenants.checks.label = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.label()', data );
    //logger.debug( 'checks.label()', value, data, opts );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.label = value;
        data.entity.get().DYN.records[data.index].set( item );
    }
    if( !value ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.label_unset' )
        });
    } else {
        const fn = function( result ){
            let ok = true;
            if( result?.length ){
                // we have found an existing label
                //  this is normal if the found entity is the same than ours
                const found_entity = result[0].entity;
                ok = ( item.entity === found_entity );
            }
            return ok ? null : new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.label_exists' )
            });
        };
        const promise =
            Meteor.isClient ? Meteor.callAsync( 'pwix.TenantsManager.m.Entities.getBy', { label: value }) : TenantsManager.Entities.s.getBy({ label: value });
        return promise
            .then(( result ) => {
                if( result?.length ){
                    return result;
                } else {
                    return Meteor.isClient ? Meteor.callAsync( 'pwix.TenantsManager.m.Records.getBy', { label: value }) : TenantsManager.Records.s.getBy({ label: value });
                }
            })
            .then(( result ) => {
                return fn( result );
            });
    }
};

// logo url
//  must be valid if set
//  be reactive to let the ImageIncluder updates itself
Tenants.checks.logoUrl = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.logoUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.logoUrl = value;
        data.entity.get().DYN.records[data.index].set( item );
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.logo_url_invalid' )
            });
        }
    }
    return null;
};

// an url among others
//  opts must have a rowId
//  label is free but mandatory
Tenants.checks.url_label = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.url_label()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    let index = opts.rowId ? _id2index( item.urls, opts.rowId ) : -1;
    if( index < 0 ){
        logger.error( 'url_label() negative index', value, data, opts );
        return null;
    }
    if( opts.update !== false ){
        item.urls[index].label = value;
        data.entity.get().DYN.records[data.index].set( item );
    }
    return value ? null : new TM.TypedMessage({
        level: index ? TM.MessageLevel.C.WARNING : TM.MessageLevel.C.ERROR,
        message: pwixI18n.label( I18N, 'records.check.urls_label_missing' )
    });
};

// an url among others
//  must be valid if set
Tenants.checks.url_url = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.supportUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    let index = opts.rowId ? _id2index( item.urls, opts.rowId ) : -1;
    if( index < 0 ){
        logger.error( 'url_url() negative index', value, data, opts );
        return null;
    }
    if( opts.update !== false ){
        item.urls[index].url = value;
        data.entity.get().DYN.records[data.index].set( item );
    }
    if( value ){
        if( validUrl.isWebUri( value )){
            return null;
        }
        return new TM.TypedMessage({
            level: index ? TM.MessageLevel.C.WARNING : TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.urls_url_invalid' )
        });
    }
    return new TM.TypedMessage({
        level: index ? TM.MessageLevel.C.WARNING : TM.MessageLevel.C.ERROR,
        message: pwixI18n.label( I18N, 'records.check.urls_url_missing' )
    });
};
