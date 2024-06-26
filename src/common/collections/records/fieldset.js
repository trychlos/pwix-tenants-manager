/*
 * pwix:tenants-manager/src/common/js/records-fieldset.js
 *
 * Define here the fields we manage at the pwix:tenants-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - by Datatables, via pwix:tabular and aldeed:tabular
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels
 */

import { Field } from 'meteor/pwix:field';
import { Forms } from 'meteor/pwix:forms';
import { Notes } from 'meteor/pwix:notes';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tracker } from 'meteor/tracker';

import { Records } from './index.js';

const _defaultFieldSet = function( conf ){
    let columns = [
        {
            name: '_id',
            type: String,
            dt_tabular: false
        },
        // a mandatory label, identifies the tenant entity
        {
            name: 'label',
            type: String,
            dt_title: pwixI18n.label( I18N, 'list.label_th' ),
            //form_check: AccountsManager.checks.check_email_address,
            form_type: Forms.FieldType.C.MANDATORY
        },
        // the entity identifier (from the entities collection)
        {
            name: 'entity',
            type: String,
            dt_visible: false
        },
        // personal data management policy page
        {
            name: 'pdmpUrl',
            type: String,
            optional: true,
            dt_visible: false,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // general terms of use
        {
            name: 'gtuUrl',
            type: String,
            optional: true,
            dt_visible: false,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // legals terms page
        {
            name: 'legalsUrl',
            type: String,
            optional: true,
            dt_visible: false,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // a page which describes the organization
        {
            name: 'homeUrl',
            type: String,
            optional: true,
            dt_title: pwixI18n.label( I18N, 'list.home_page_th' ),
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // a page to access the support
        {
            name: 'supportUrl',
            type: String,
            optional: true,
            dt_visible: false,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // a contact page
        {
            name: 'contactUrl',
            type: String,
            optional: true,
            dt_visible: false,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // the organization logo (either an Url or an embedded image, or both)
        {
            name: 'logoUrl',
            type: String,
            optional: true,
            dt_visible: false,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        {
            name: 'logoImage',
            type: String,
            optional: true,
            dt_visible: false,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // support email address
        {
            name: 'supportEmail',
            type: String,
            optional: true,
            dt_visible: false,
            form_type: Forms.FieldType.C.OPTIONAL
        },
        // contact email address
        {
            name: 'contactEmail',
            type: String,
            optional: true,
            dt_title: pwixI18n.label( I18N, 'list.contact_email_th' ),
            form_type: Forms.FieldType.C.OPTIONAL
        },
        Notes.fieldDef(),
        {
            name: 'createdAt',
            schema: false,
            dt_visible: false
        },
        {
            name: 'createdBy',
            schema: false,
            dt_visible: false
        },
        {
            name: 'updatedAt',
            schema: false,
            dt_visible: false
        },
        {
            name: 'updatedBy',
            schema: false,
            dt_visible: false
        }
    ];

    return columns;
};

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    let columns = _defaultFieldSet( conf );
    let _fieldset = new Field.Set( columns );
    if( conf.recordFields ){
        _fieldset.extend( conf.recordFields );
    }
    Records.fieldSet.set( _fieldset );
});
