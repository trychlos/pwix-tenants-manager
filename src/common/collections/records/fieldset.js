/*
 * pwix:tenants-manager/src/common/collections/records/fieldset.js
 *
 * Define here the fields we manage at the pwix:tenants-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels.
 * 
 * Note: in this multi-validities domain, the main tabular display is Tenants-driven.
 * We do not define here the tabular display. See Tenants/fieldset for that.
 */

import _ from 'lodash';

import { Field } from 'meteor/pwix:field';
import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { Notes } from 'meteor/pwix:notes';
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
            form_check: Tenants.checks.label,
            form_type: Forms.FieldType.C.MANDATORY
        },
        // personal data management policy page
        {
            name: 'pdmpUrl',
            type: String,
            optional: true,
            form_check: Tenants.checks.pdmpUrl,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // general terms of use
        {
            name: 'gtuUrl',
            type: String,
            optional: true,
            form_check: Tenants.checks.gtuUrl,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // legals terms page
        {
            name: 'legalsUrl',
            type: String,
            optional: true,
            form_check: Tenants.checks.legalsUrl,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // a page which describes the tenant
        {
            name: 'homeUrl',
            type: String,
            optional: true,
            form_check: Tenants.checks.homeUrl,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // a page to access the support
        {
            name: 'supportUrl',
            type: String,
            optional: true,
            form_check: Tenants.checks.supportUrl,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // a contact page
        {
            name: 'contactUrl',
            type: String,
            optional: true,
            form_check: Tenants.checks.contactUrl,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // the tenant logo
        {
            name: 'logoUrl',
            type: String,
            optional: true,
            form_check: Tenants.checks.logoUrl,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // support email address
        {
            name: 'supportEmail',
            type: String,
            optional: true,
            form_check: Tenants.checks.supportEmail,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // contact email address
        {
            name: 'contactEmail',
            type: String,
            optional: true,
            form_check: Tenants.checks.contactEmail,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // as many urls as you want
        // dt_data: 'any' prevents "MongoServerError: FieldPath field names may not start with '$'. Consider using $getField or $setField." exception
        // dt_data: 'emails.0.address' gives server-side sort for the columns where we are using a Blaze template
        {
            name: 'urls',
            type: Array,
            optional: true,
            dt_visible: false
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
            dt_data: 'any',
            form_check: Tenants.checks.url_label,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        {
            name: 'urls.$.url',
            type: String,
            optional: true,
            dt_data: 'any',
            form_check: Tenants.checks.url_url,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // as many email addresses as you want
        {
            name: 'emails',
            type: Array,
            optional: true,
            dt_visible: false
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
            dt_data: 'any',
            form_check: Tenants.checks.email_label,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        {
            name: 'emails.$.email',
            type: String,
            optional: true,
            dt_data: 'any',
            form_check: Tenants.checks.email_email,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        Notes.fieldDef()
    ];
    columns = columns.concat( Validity.recordsFieldDef());
    columns = columns.concat( Timestampable.fieldDef());
    return columns;
};

Tracker.autorun(() => {
    if( Tenants.ready.get()){
        const conf = TenantsManager.configure();
        let columns = _defaultFieldSet( conf );
        let fieldset = new Field.Set( columns );
        // add application-configured fieldset if any
        if( conf.recordFields ){
            fieldset.extend( conf.recordFields );
        }
        Records.fieldSet.set( fieldset );
    }
});
