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

import { Field } from 'meteor/pwix:field';
import { Forms } from 'meteor/pwix:forms';
import { Notes } from 'meteor/pwix:notes';
import { Timestampable } from 'meteor/pwix:collection-timestampable';
import { Tracker } from 'meteor/tracker';
import { Validity } from 'meteor/pwix:validity';

import { Tenants } from '../tenants/index.js';

import { Records } from './index.js';

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
        // a page which describes the organization
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
        // the organization logo
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
        Notes.fieldDef(),
        Validity.recordsFieldDef(),
        Timestampable.fieldDef()
    ];
    return columns;
};

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    let columns = _defaultFieldSet( conf );
    let fieldset = new Field.Set( columns );
    // add application-configured fieldset if any
    if( conf.recordFields ){
        fieldset.extend( conf.recordFields );
    }
    Records.fieldSet.set( fieldset );
});
