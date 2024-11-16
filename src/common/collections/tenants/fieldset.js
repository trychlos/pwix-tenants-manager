/*
 * pwix:tenants-manager/src/common/collections/tenants/fieldset.js
 *
 * Define here the fields to be published and/or rendered in the tabular display.
 */

import { Field } from 'meteor/pwix:field';
import { Notes } from 'meteor/pwix:notes';
import { pwixI18n } from 'meteor/pwix:i18n';
import { Tracker } from 'meteor/tracker';
import { Validity } from 'meteor/pwix:validity';

import { Tenants } from './index.js';

const _defaultFieldSet = function( conf ){
    let columns = [
        // a mandatory label, identifies the tenant entity
        {
            name: 'label',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.label_th' )
        },
        // the tenant managers as an array, maybe empty
        {
            name: 'managers',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.managers_th' ),
            dt_render( data, type, rowData ){
                let emails = [];
                rowData.managers.forEach(( it ) => {
                    emails.push( it.emails[0].address );
                });
                return emails.join( ', ' );
            }
        },
        // entity notes in tabular display
        {
            name: 'entity_notes',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.entity_notes_th' ),
            dt_className: 'dt-center',
            dt_template: Meteor.isClient && Template.tm_entity_notes_dt
        },
        // personal data management policy page
        {
            name: 'pdmpUrl',
            schema: false,
            dt_visible: false
        },
        // general terms of use
        {
            name: 'gtuUrl',
            schema: false,
            dt_visible: false
        },
        // legals terms page
        {
            name: 'legalsUrl',
            schema: false,
            dt_visible: false
        },
        // a page which describes the organization
        {
            name: 'homeUrl',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.home_page_th' )
        },
        // a page to access the support
        {
            name: 'supportUrl',
            schema: false,
            dt_visible: false
        },
        // a contact page
        {
            name: 'contactUrl',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.contact_page_th' )
        },
        // the organization logo (either an Url or an embedded image, or both)
        {
            name: 'logoUrl',
            schema: false,
            dt_visible: false
        },
        {
            name: 'logoImage',
            schema: false,
            dt_visible: false
        },
        // support email address
        {
            name: 'supportEmail',
            schema: false,
            dt_visible: false
        },
        // contact email address
        {
            name: 'contactEmail',
            schema: false,
            dt_title: pwixI18n.label( I18N, 'list.contact_email_th' )
        },
        Notes.fieldDef(),
        Validity.recordsFieldDef(),
        Timestampable.fieldDef(),
        {
            name: 'DYN',
            dt_visible: false
        }
    ];
    return columns;
};

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    let columns = _defaultFieldSet( conf );
    let fieldset = new Field.Set( columns );
    // add application-configured fieldset if any
    if( conf.tenantFields ){
        fieldset.extend( conf.tenantFields );
    }
    // update the fieldSet definitions to display start and end effect dates
    let def = fieldset.byName( 'effectStart' );
    if( def ){
        def.set({
            dt_visible: true,
            dt_title: pwixI18n.label( I18N, 'list.effect_start_th' ),
            dt_templateContext( rowData ){
                return {
                    date: rowData.effectStart
                };
            }
        });
    }
    def = fieldset.byName( 'effectEnd' );
    if( def ){
        def.set({
            dt_visible: true,
            dt_title: pwixI18n.label( I18N, 'list.effect_end_th' ),
            dt_templateContext( rowData ){
                return {
                    date: rowData.effectEnd
                };
            }
        });
    }
    Tenants.fieldSet.set( fieldset );
});
