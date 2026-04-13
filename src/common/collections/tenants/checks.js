/*
 * pwix:tenants-manager/src/common/collections/tenants/checks.js
 */

import _ from 'lodash';
const assert = require( 'assert' ).strict;
import validator from 'email-validator';
import validUrl from 'valid-url';

import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { TM } from 'meteor/pwix:typed-message';

import { Tenants } from './index.js';

import { Entities } from '../entities/index.js';
import { Records } from '../records/index.js';

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

// contact email
//  must be valid if set
Tenants.checks.contactEmail = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.contactEmail()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.contactEmail = value;
    }
    if( value ){
        if( !validator.validate( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.contact_email_invalid' )
            });
        }
    }
    return null;
};

// contact page url
//  must be valid if set
Tenants.checks.contactUrl = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.contactUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.contactUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.contact_url_invalid' )
            });
        }
    }
    return null;
};

// check that the count of email addresses is correct relatively to configured min and max
// this is neither a field check nor a cross check which explain the different prototype
// we count the rows, which may or may not be valid but all are counted
// returns null or a TypedMessage
Tenants.checks.email_count = async function( emails ){
    const min = TenantsManager.configure().minGeneralizedEmails;
    const max = TenantsManager.configure().maxGeneralizedEmails;
    const count = emails.length;
    if( count < min ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.emails_min', min )
        });
    }
    if( max !== -1 && max > count ){
        return new TM.TypedMessage({
            level: TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.emails_max', max )
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
    }
    const tmCount = Tenants.checks.email_count( item.emails );
    if( value ){
        if( !validator.validate( value )){
            return new TM.TypedMessage({
                level: tmCount ? TM.MessageLevel.C.ERROR : TM.MessageLevel.C.WARNING,
                message: pwixI18n.label( I18N, 'records.check.emails_email_invalid' )
            });
        }
    } else {
        return new TM.TypedMessage({
            level: tmCount ? TM.MessageLevel.C.ERROR : TM.MessageLevel.C.WARNING,
            message: pwixI18n.label( I18N, 'records.check.emails_email_missing' )
        });
    }
    return null;
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
    }
    if( value ){
        return null;
    }
    const tmCount = Tenants.checks.email_count( item.emails );
    return new TM.TypedMessage({
        level: tmCount ? TM.MessageLevel.C.ERROR : TM.MessageLevel.C.WARNING,
        message: pwixI18n.label( I18N, 'records.check.emails_label_missing' )
    });
};

// cross check an email row
//  we want both label+email - and refuse empty lines
//  we also make sure the count of email addresses is correct relatively to configured min and max
Tenants.checks.email_row = async function( data, opts ){
    _assert_data_content( 'Tenants.checks.email_row()', data );
    //logger.debug( 'email_row()', arguments );
    let item = data.entity.get().DYN.records[data.index].get();
    let index = opts.rowId ? _id2index( item.emails, opts.rowId ) : -1;
    if( index < 0 ){
        logger.error( 'email_row() negative index', data, opts );
        return null;
    }
    const row = item.emails[index];
    const tmCount = Tenants.checks.email_count( item.emails );
    if( tmCount ){
        return tmCount;
    }
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

// general terms o fuse page url
//  must be valid if set
Tenants.checks.gtuUrl = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.gtuUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.gtuUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.gtu_url_invalid' )
            });
        }
    }
    return null;
};

// home page url
//  must be valid if set
Tenants.checks.homeUrl = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.homeUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.homeUrl = value;
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
            Meteor.isClient ? Meteor.callAsync( 'pwix.TenantsManager.m.Entities.getBy', { label: value }) : Entities.s.getBy({ label: value });
        return promise
            .then(( result ) => {
                if( result?.length ){
                    return result;
                } else {
                    return Meteor.isClient ? Meteor.callAsync( 'pwix.TenantsManager.m.Records.getBy', { label: value }) : Records.s.getBy({ label: value });
                }
            })
            .then(( result ) => {
                return fn( result );
            });
    }
};

// legal terms page url
//  must be valid if set
Tenants.checks.legalsUrl = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.legalsUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.legalsUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.legals_url_invalid' )
            });
        }
    }
    return null;
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

// personal data management policy page url
//  must be valid if set
Tenants.checks.pdmpUrl = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.pdmpUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.pdmpUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.pdmp_url_invalid' )
            });
        }
    }
    return null;
};

// support email
//  must be valid if set
Tenants.checks.supportEmail = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.supportEmail()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.supportEmail = value;
    }
    if( value ){
        if( !validator.validate( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.support_email_invalid' )
            });
        }
    }
    return null;
};

// support page url
//  must be valid if set
Tenants.checks.supportUrl = async function( value, data, opts ){
    _assert_data_content( 'Tenants.checks.supportUrl()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    if( opts.update !== false ){
        item.supportUrl = value;
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.support_url_invalid' )
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
    }
    return value ? null : new TM.TypedMessage({
        level: index ? TM.MessageLevel.C.WARNING : TM.MessageLevel.C.ERROR,
        message: pwixI18n.label( I18N, 'records.check.urls_label_missing' )
    });
};

// cross check an url row
//  we want both label+email, or refuse - do not want an empty line
Tenants.checks.url_row = async function( data, opts ){
    _assert_data_content( 'Tenants.checks.url_row()', data );
    let item = data.entity.get().DYN.records[data.index].get();
    let index = opts.rowId ? _id2index( item.urls, opts.rowId ) : -1;
    if( index < 0 ){
        logger.error( 'url_row() negative index', data, opts );
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
    }
    if( value ){
        if( !validUrl.isWebUri( value )){
            return new TM.TypedMessage({
                level: index ? TM.MessageLevel.C.WARNING : TM.MessageLevel.C.ERROR,
                message: pwixI18n.label( I18N, 'records.check.urls_url_invalid' )
            });
        }
    } else {
        return new TM.TypedMessage({
            level: index ? TM.MessageLevel.C.WARNING : TM.MessageLevel.C.ERROR,
            message: pwixI18n.label( I18N, 'records.check.urls_url_missing' )
        });
    }
    return null;
};
