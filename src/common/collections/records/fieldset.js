/*
 * pwix:tenants-manager/src/common/collections/records/fieldset.js
 *
 * Define here the fields we manage at the pwix:tenants-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels.
 * 
 * Note: in this multi-validities domain, the main tabular display is records-driven.
 * This Records fieldset defines so *both* the Records schema and the Tabular display.
 */

import _ from 'lodash';

import { Field } from 'meteor/pwix:field';
import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { Notes } from 'meteor/pwix:notes';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import { Timestampable } from 'meteor/pwix:collection-timestampable';
import { Tracker } from 'meteor/tracker';
import { Validity } from 'meteor/pwix:validity';

import { Tenants } from '../tenants/index.js';

import { Records } from './index.js';

const logger = Logger.get();

const _defaultFieldSet = function( conf ){
    let columns = [
        // a mandatory label, identifies the tenant entity
        {
            name: 'label',
            type: String,
            dt_title: pwixI18n.label( I18N, 'list.label_th' ),
            form_check: Tenants.checks.label,
            form_type: Forms.FieldType.C.MANDATORY
        }
    ];
    // if the caller is enough and happy with dedicated emails
    if( conf.withDedicatedEmails ){
        columns = columns.concat([
            // contact email address
            {
                name: 'contactEmail',
                type: String,
                optional: true,
                dt_title: pwixI18n.label( I18N, 'list.contact_email_th' ),
                form_check: Tenants.checks.contactEmail,
                form_type: Forms.FieldType.C.OPTIONAL
            }
        ]);
    }
    // if the caller is enough and happy with dedicated urls
    if( conf.withDedicatedUrls ){
        columns = columns.concat([
            // the tenant home page
            {
                name: 'homeUrl',
                type: String,
                optional: true,
                dt_title: pwixI18n.label( I18N, 'list.home_page_th' ),
                form_check: Tenants.checks.homeUrl,
                form_type: Forms.FieldType.C.OPTIONAL
            }
        ]);
    }
    // if the caller wants generalized email addresses
    // as many emails as you want
    if( conf.withGeneralizedEmails ){
        columns = columns.concat([
            {
                name: 'emails',
                type: Array,
                optional: true,
                tabular: false
            },
            {
                name: 'emails.$',
                type: Object,
                optional: true,
                tabular: false
            },
            {
                name: 'emails.$._id',
                type: String,
                dt_data: false,
                dt_visible: false
            },
            {
                name: 'emails.$.label',
                type: String,
                optional: true,
                dt_visible: false,
                dt_title: pwixI18n.label( I18N, 'list.email_label_th' ),
                form_check: Tenants.checks.email_label,
                form_type: Forms.FieldType.C.OPTIONAL,
                form_status: Forms.C.ShowStatus.NONE
            },
            {
                name: 'emails.$.email',
                type: String,
                optional: true,
                dt_visible: false,
                dt_title: pwixI18n.label( I18N, 'list.email_email_th' ),
                form_check: Tenants.checks.email_email,
                form_type: Forms.FieldType.C.OPTIONAL,
                form_status: Forms.C.ShowStatus.NONE
            }
        ]);
    }
    // if the caller wants generalized urls
    // as many urls as you want
    if( conf.withGeneralizedUrls ){
        columns = columns.concat([
            {
                name: 'urls',
                type: Array,
                optional: true,
                tabular: false
            },
            {
                name: 'urls.$',
                type: Object,
                optional: true,
                tabular: false
            },
            {
                name: 'urls.$._id',
                type: String,
                dt_data: false,
                dt_visible: false
            },
            {
                name: 'urls.$.label',
                type: String,
                optional: true,
                dt_visible: false,
                dt_title: pwixI18n.label( I18N, 'list.url_label_th' ),
                form_check: Tenants.checks.url_label,
                form_type: Forms.FieldType.C.OPTIONAL,
                form_status: Forms.C.ShowStatus.NONE
            },
            {
                name: 'urls.$.url',
                type: String,
                optional: true,
                dt_visible: false,
                dt_title: pwixI18n.label( I18N, 'list.url_url_th' ),
                form_check: Tenants.checks.url_url,
                form_type: Forms.FieldType.C.OPTIONAL,
                form_status: Forms.C.ShowStatus.NONE
            },
        ]);
    }
    columns = columns.concat([
        // (tabular) the tenant managers as an array, maybe empty
        {
            name: 'managers',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.managers_th' ),
            dt_render( data, type, rowData ){
                let emails = [];
                rowData.DYN.managers.forEach(( it ) => {
                    emails.push( it.emails[0].address );
                });
                return emails.join( ', ' );
            }
        },
        // the tenant logo
        //  not considered as an url because it is expected to be able to display an image and is so treated differently
        {
            name: 'logoUrl',
            type: String,
            optional: true,
            dt_title: pwixI18n.label( I18N, 'list.logo_url_th' ),
            form_check: Tenants.checks.logoUrl,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // (tabular) entity notes
        {
            name: 'entity_notes',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.entity_notes_th' ),
            dt_className: 'dt-center',
            dt_template: Meteor.isClient && Template.tm_entity_notes_dt
        },
        // record notes
        Notes.fieldDef(),
        {
            name: 'DYN',
            schema: false,
            dt_hidden: true
        },
        // because we cannot modify the validity fields definitions, insert here some tabular data
        // (tabular) the first starting date / the last ending date
        {
            name: 'first_starting',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.effect_start_th' ),
            dt_className: 'dt-center'
        },
        {
            name: 'last_ending',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.effect_end_th' ),
            dt_className: 'dt-center'
        },
    ]);
    columns = columns.concat( Validity.recordsFieldDef());
    columns = columns.concat( Timestampable.fieldDef());
    return columns;
};

// configuration has changed -> fieldset must be recomputed
Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    const fieldset = new Field.Set( _defaultFieldSet( conf ));
    //logger.debug( 'conf fieldset with', conf.withDedicatedEmails, conf.withDedicatedUrls, conf.withGeneralizedEmails, conf.withGeneralizedUrls, fieldset.names());
    Records.fieldSet.set( fieldset );
    Records.status.set( 'haveFieldset', true );
    Records.status.set( 'haveSchema', false );
});

// fieldset has changed -> dependants have to be reset
Tracker.autorun(() => {
    const fieldset = Records.fieldSet.get();
    const haveCollection = Records.status.get( 'haveCollection' );
    if( fieldset && haveCollection ){
        //logger.debug( 'define schema with', fieldset.names());
        if( Records.collection.attachSchema ){
            logger.verbose({ verbosity: TenantsManager.configure().verbosity, against: TenantsManager.C.Verbose.ATTACHSCHEMA }, 'attaching Records schema' );
            Records.collection.attachSchema( new SimpleSchema( fieldset.toSchema()), { replace: true });
            Records.collection.attachBehaviour( 'timestampable', { replace: true });
            Records.status.set( 'haveSchema', true );
        } else {
            logger.warning( 'Records.collection.attachSchema is not a function' );
        }
    }
});

Tracker.autorun(() => {
    //logger.debug( 'Records.fieldSet', Records.fieldSet.get().names());
});
