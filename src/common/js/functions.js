/*
 * pwix:tenants-manager/src/common/js/functions.js
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { TM } from 'meteor/pwix:typed-message';

import { Tenants } from '../collections/tenants/index.js';

const logger = Logger.get();

/**
 * @summary Check all the data of the Tenant
 * @param {Object} tenant an object with an 'entity' and a 'record' keys to be checked
 * @param {Object} opts an optional options object with following keys:
 *  - verbose: list all done checks, even if they do not detect any error
 * @returns {Array<TypedMessage>|null} list of errors, or null
 */
TenantsManager.checkByTenant = async function( tenant, opts={} ){
    if( !tenant || !_.isObject( tenant )){
        logger.error( 'checkByTenant() expects a \'tenant\' object, got', tenant, 'throwing...' );
        throw new Error( 'Bad argument: tenant' );
    }
    const keys = Object.keys( tenant );
    if( !keys.includes( 'entity' ) || !keys.includes( 'record' )){
        logger.error( 'checkByTenant() expects \'entity\' and \'record\' keys, got', keys, 'throwing...' );
        throw new Error( 'Bad content: tenant' );
    }
    // prepare data
    const data = { entity: new ReactiveVar( null ), index: 0 };
    const entityRv = data.entity;
    entityRv.set( _.cloneDeep( tenant.entity ));
    const entity = entityRv.get();
    entity.DYN = { records: [ new ReactiveVar( null ) ]};
    const recordsRv = entity.DYN.records[0];
    recordsRv.set( tenant.record );
    // the array of message to be returned
    let result = null;
    // the check functions
    const _fnRecordCheck = async function( name, value ){
        if( arguments.length > 1 ){
            const msgs = await Tenants.checks[name]( value, data, { update: false });
            if( msgs ){
                result = result || [];
                result = result.concat( msgs );
            } else if( opts.verbose ){
                result = result || [];
                result.push( new TM.TypedMessage({
                    level: TM.MessageLevel.C.INFO,
                    message: pwixI18n.label( I18N, 'records.check.name_done', name )
                }));
            }
        // cross checks
        } else {
            //const msgs = await Organizations.checks[name]( data, { update: false, opCheck: true });
            //if( msgs ){
            //    all_msgs = all_msgs.concat( msgs );
            //}
        }
    };
    const _fnRowCheck = async function( name, value, item ){
        let msgs = null;
        if( arguments.length === 3 ){
            msgs = await Tenants.checks[name]( value, data, { update: false, rowId: item._id });
        } else {
            // cross check
            item = arguments[1];
            msgs = await Tenants.checks[name]( data, { update: false, rowId: item._id });
        }
        if( msgs ){
            result = result || [];
            result = result.concat( msgs );
        } else if( opts.verbose ){
            result.push( new TM.TypedMessage({
                level: TM.MessageLevel.C.INFO,
                message: pwixI18n.label( I18N, 'records.check.name_item_done', name, item._id )
            }));
        }
    };
    // and checks...
    await _fnRecordCheck( 'label', tenant.record.label );
    const generalizedEmails = TenantsManager.configure().withGeneralizedEmails;
    if( generalizedEmails ){
        const emails = tenant.record.emails || [];
        for( const email of emails ){
            await _fnRowCheck( 'email_label', email.label, email );
            await _fnRowCheck( 'email_email', email.email, email );
            await _fnRowCheck( 'email_row', email );
        }
    }
    const dedicatedEmails = TenantsManager.configure().withDedicatedEmails;
    if( dedicatedEmails ){
        await _fnRecordCheck( 'contactEmail', tenant.record.contactEmail );
        //await _fnRecordCheck( 'supportEmail', tenant.record.supportEmail );
    }
    const generalizedUrls = TenantsManager.configure().withGeneralizedUrls;
    if( generalizedUrls ){
        const urls = tenant.record.urls || [];
        for( const url of urls ){
            await _fnRowCheck( 'url_label', url.label, url );
            await _fnRowCheck( 'url_url', url.url, url );
            await _fnRowCheck( 'url_row', url );
        }
    }
    const dedicatedUrls = TenantsManager.configure().withDedicatedUrls;
    if( dedicatedUrls ){
        //await _fnRecordCheck( 'contactUrl', tenant.record.contactUrl );
        //await _fnRecordCheck( 'gtuUrl', tenant.record.gtuUrl );
        await _fnRecordCheck( 'homeUrl', tenant.record.homeUrl );
        //await _fnRecordCheck( 'legalsUrl', tenant.record.legalsUrl );
        //await _fnRecordCheck( 'pdmpUrl', tenant.record.pdmpUrl );
        //await _fnRecordCheck( 'supportUrl', tenant.record.supportUrl );
    }
    await _fnRecordCheck( 'logoUrl', tenant.record.logoUrl );
    return result;
};

/**
 * @summary pwix:roles is responsible for managing the scoped roles of the application, as far as it knows which scopes are to be managed.
 * @returns {Array} list of scopes and their labels
 *  NB: the caller should prefer the corresponding (reactive) publication
*/
TenantsManager.getScopes = async function(){
    if( !await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.get_scopes' )){
        return [];
    }
    return await ( Meteor.isClient ? Meteor.callAsync( 'pwix.TenantsManager.m.Tenants.getScopes' ) : TenantsManager.s.getScopes());
};

// as of v1.5.0, permissions are simplified
const _permissions = {
    'pwix.tenants_manager.feat.roles': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.entities.fn.upsert': 'pwix.tenants_manager.feat.edit',
    'pwix.tenants_manager.records.fn.upsert': 'pwix.tenants_manager.feat.edit',
    'pwix.tenants_manager.fn.delete_tenant': 'pwix.tenants_manager.feat.delete',
    'pwix.tenants_manager.fn.get_scopes': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.fn.set_managers': 'pwix.tenants_manager.feat.edit',
    'pwix.tenants_manager.fn.upsert': 'pwix.tenants_manager.feat.edit',
    'pwix.tenants_manager.pub.list_all': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.pub.list_one': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.pub.closests': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.pub.tabular': 'pwix.tenants_manager.feat.list',
    'pwix.tenants_manager.pub.known_scopes': 'pwix.tenants_manager.feat.list'
};

/**
 * @param {String} action
 * @param {String} userId
 * @returns {Boolean} true if the current user is allowed to do the action
 */
TenantsManager.isAllowed = async function( action, userId=null ){
    let allowed = false;
    const fn = TenantsManager.configure().allowFn;
    const newAction = _permissions[action] || action;
    const newArgs = [ ...arguments ];
    newArgs.shift();
    if( fn ){
        allowed = await fn( newAction, ...newArgs );
    }
    return allowed;
};

/**
 * @summary Configure the edition dialog
 * @param {Object} opts an optional options object with following keys:
 *  - closeAfterNew
 *  - identTopTemplate
 *  - tabsFn
 * @returns {Boolean} true if successful
 */
TenantsManager.setupEditor = function( opts={} ){
    check( opts, Object );
};

/**
 * @summary Setup the tabular display
 * @param {Object} opts an optional options object with following keys:
 * @param {Function} buttonsHookFn an optional function to be added to the buttons hooks array
 */
TenantsManager.setupTabular = function( opts={}, buttonsHookFn=null ){
    // install buttons hook if any
    if( buttonsHookFn ){
        TenantsManager.Tabular._buttonsHooks.push( buttonsHookFn );
    }
    // merge options with default and instanciates the Tabular.Table
    const options = _.merge( {}, TenantsManager.Tabular._defaultOptions(), opts );
    TenantsManager.Tabular.init( options );
};
