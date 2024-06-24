/*
 * pwix:tenants-manager/src/common/js/fieldset.js
 *
 * Define here the fields we manage at the pwix:tenants-manager level, so that these definitions can be used:
 * - by SimpleSchema
 * - by Datatables, via pwix:tabular and aldeed:tabular
 * - when rendering the edition templates
 * - chen cheking the fields in the edition panels
 */

import { Field } from 'meteor/pwix:field';
import { Notes } from 'meteor/pwix:notes';
import { pwixI18n } from 'meteor/pwix:i18n';

import '../collections/tenants/checks.js';

TenantsManager.fieldSet = new Field.Set(
    {
        name: '_id',
        type: String,
        dt_tabular: false
    },
    // a mandatory unique label, identifies this tenant record, i.e. entity+validity
    {
        name: 'label',
        type: String,
        dt_title: pwixI18n.label( I18N, 'list.label_th' ),
    },
    // the tenant entity identifier
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
        dt_visible: false
    },
    // general terms of use
    {
        name: 'gtuUrl',
        type: String,
        optional: true,
        dt_visible: false
    },
    // legals terms page
    {
        name: 'legalsUrl',
        type: String,
        optional: true,
        dt_visible: false
    },
    // a page which describes the organization
    {
        name: 'homeUrl',
        type: String,
        optional: true,
        dt_title: pwixI18n.label( I18N, 'list.homepage_th' ),
    },
    // a page to access the support
    {
        name: 'supportUrl',
        type: String,
        optional: true,
        dt_visible: false
    },
    // a contact page
    {
        name: 'contactUrl',
        type: String,
        optional: true,
        dt_visible: false
    },
    // the organization logo (either an Url or an embedded image)
    {
        name: 'logoUrl',
        type: String,
        optional: true,
        dt_visible: false
    },
    {
        name: 'logoImage',
        type: String,
        optional: true,
        dt_visible: false
    },
    // support email address
    {
        name: 'supportEmail',
        type: String,
        optional: true,
        dt_visible: false
    },
    // contact email address
    {
        name: 'contactEmail',
        type: String,
        optional: true,
        dt_title: pwixI18n.label( I18N, 'list.contact_email_th' ),
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
);
