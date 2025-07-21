/*
 * /imports/client/components/TenantRecordPropertiesPanel/TenantRecordPropertiesPanel.js
 *
 * Tenant properties pane.
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - index: the index of the edited record
 * - checker: the Forms.Checker which manages the parent component
 * - enableChecks: whether the checks should be enabled at startup, defaulting to true
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Records } from '../../../common/collections/records/index.js';

import './TenantRecordPropertiesPanel.html';

Template.TenantRecordPropertiesPanel.onCreated( function(){
    const self = this;

    self.TM = {
        fields: {
            label: {
                js: '.js-label'
            },
            pdmpUrl: {
                js: '.js-pdmp'
            },
            gtuUrl: {
                js: '.js-gtu'
            },
            legalsUrl: {
                js: '.js-legals'
            },
            homeUrl: {
                js: '.js-home'
            },
            logoUrl: {
                js: '.js-logo'
            },
            supportUrl: {
                js: '.js-support-url'
            },
            contactUrl: {
                js: '.js-contact-url'
            },
            supportEmail: {
                js: '.js-support-email'
            },
            contactEmail: {
                js: '.js-contact-email'
            },
            /*
            managers: {
                js: '.js-managers',
                val( item ){
                    let emails = [];
                    ( item.DYN?.managers || [] ).every(( o ) => {
                        emails.push( o.emails[0].address );
                        return true;
                    });
                    return emails.join( ', ' );
                },
                type: 'INFO'
            },
            */
        },
        // the Checker instance
        checker: new ReactiveVar( null ),

        // advertise of the checker status
        advertise( checker ){
            const status = checker.status();
            const validity = checker.validity();
            self.$( '.TenantRecordPropertiesPanel' ).trigger( 'iz-checker', { status: status, validity: validity });
        }
    };
});

Template.TenantRecordPropertiesPanel.onRendered( function(){
    const self = this;
    const dataContext = Template.currentData();

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const parentChecker = Template.currentData().checker?.get();
        const checker = self.TM.checker.get();
        if( parentChecker && !checker ){
            const enabled = Template.currentData().enableChecks !== false;
            self.TM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                panel: new Forms.Panel( self.TM.fields, Records.fieldSet.get()),
                data: {
                    entity: Template.currentData().entity,
                    index: Template.currentData().index
                },
                setForm: Template.currentData().entity.get().DYN.records[Template.currentData().index].get(),
                enabled: enabled
            }));
        }
    });

    // advertise the assistant of the status of this panel
    self.autorun(() => {
        const checker = self.TM.checker.get();
        if( checker ){
            self.TM.advertise( checker );
        }
    });
});

Template.TenantRecordPropertiesPanel.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // for label
    itFor( label ){
        return 'record_properties_'+label+'_'+this.index;
    },

    // parms for ImageIncluder
    parmsImage(){
        return {
            imageUrl: this.entity.get().DYN.records[this.index].get().logoUrl
        };
    }
});

Template.TenantRecordPropertiesPanel.events({
    // ask for clear the panel
    'iz-clear-panel .TenantRecordPropertiesPanel'( event, instance ){
        instance.TM.checker.get().clear();
    },
    // ask for enabling the checker (when this panel is used inside of an assistant)
    'iz-enable-checks .TenantRecordPropertiesPanel'( event, instance, enabled ){
        const checker = instance.TM.checker.get();
        if( checker ){
            checker.enabled( enabled );
            if( enabled ){
                checker.check({ update: false }).then(() => { instance.TM.advertise( checker ); });
            }
        }
        return false;
    }
});
