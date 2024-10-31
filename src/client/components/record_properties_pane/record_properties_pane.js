/*
 * /imports/client/components/record_properties_pane/record_properties_pane.js
 *
 * Organization properties pane.
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - index: the index of the edited record
 * - checker: the Forms.Checker which manages the parent component
 * - vtpid: the identifier of the validity tab period, to be used in 'panel-data' events
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Records } from '../../../common/collections/records/index.js';

import './record_properties_pane.html';

Template.record_properties_pane.onCreated( function(){
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
        checker: new ReactiveVar( null )
    };
});

Template.record_properties_pane.onRendered( function(){
    const self = this;
    const dataContext = Template.currentData();

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const parentChecker = Template.currentData().checker.get();
        const checker = self.TM.checker.get();
        if( parentChecker && !checker ){
            self.TM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                panel: new Forms.Panel( self.TM.fields, Records.fieldSet.get()),
                data: {
                    entity: Template.currentData().entity,
                    index: Template.currentData().index
                },
                setForm: Template.currentData().entity.get().DYN.records[Template.currentData().index].get()
            }));
        }
    });
});

Template.record_properties_pane.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // parms for ImageIncluder
    parmsImage(){
        return {
            imageUrl: this.entity.get().DYN.records[this.index].get().logoUrl
        };
    }
});

Template.record_properties_pane.events({
    // edit the managers
    'click .js-edit-managers'( event, instance ){
        const self = this;
        Modal.run({
            mdBody: 'accounts_select',
            mdButtons: [{ id: Modal.C.Button.NEW, classes: 'btn-outline-primary me-auto' }, Modal.C.Button.CANCEL, { id: Modal.C.Button.OK, type: 'submit' }],
            mdClasses: 'modal-lg',
            mdClassesContent: Meteor.TM.Pages.current.page().get( 'theme' ),
            mdTitle: pwixI18n.label( I18N, 'organizations.properties.managers_modal' ),
            selected: self.item.get().DYN.managers || [],
            update( selected ){
                // get the item updated
                self.item.get().DYN.managers = selected;
                // get the form updated
                instance.TM.form.get().setField( 'managers', self.item.get());
                // advertise parents
                instance.$( '.c-organization-properties-pane' ).trigger( 'panel-data', {
                    emitter: 'managers',
                    id: self.vtpid,
                    ok: true,
                    data: selected
                });
            }
        });
    },

    // ask for clear the panel
    'iz-clear-panel .c-organization-properties-pane'( event, instance ){
        instance.TM.form.get().clear();
    }
});
