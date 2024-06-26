/*
 * /imports/client/components/record_properties_pane/record_properties_pane.js
 *
 * Organization properties pane.
 *
 * Parms:
 * - item: a ReactiveVar which holds the organization validity record to edit
 * - checker: the parent Forms.Checker as a ReactiveVar
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

    self.APP = {
        fields: {
            label: {
                js: '.js-label',
                type: 'SAVE'
            },
            baseUrl: {
                js: '.js-baseurl',
                type: 'WORK'
            },
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
            supportUrl: {
                js: '.js-support-url',
                type: 'OPTIONAL'
            },
            supportEmail: {
                js: '.js-support-email',
                type: 'OPTIONAL'
            },
            contactEmail: {
                js: '.js-contact',
                type: 'OPTIONAL'
            }
        },
        // the CoreApp.FormChecker instance
        form: new ReactiveVar( null ),

        // send the panel data to the parent
        sendPanelData( dataContext, valid ){
            if( _.isBoolean( valid )){
                self.$( '.c-organization-properties-pane' ).trigger( 'panel-data', {
                    emitter: 'properties',
                    id: dataContext.vtpid,
                    ok: valid,
                    data: self.APP.form.get().getForm()
                });
            }
        }
    };
});

Template.record_properties_pane.onRendered( function(){
    const self = this;
    const dataContext = Template.currentData();

    // initialize the FormChecker for this panel
    /*
    self.autorun(() => {
        self.APP.form.set( new Forms.Checker({
            instance: self,
            collection: Organizations,
            fields: self.APP.fields,
            entityChecker: Template.currentData().entityChecker
        }));
    });

    // set data inside of an autorun so that it is reactive to data context changes
    // initialize the display (check indicators) - let the error messages be displayed here: there should be none (though may be warnings)
    self.autorun(() => {
        const dataContext = Template.currentData();
        self.APP.form.get().setData({
            item: dataContext.item
        });
        self.APP.form.get().setForm( dataContext.item.get());
        self.APP.form.get().check({ update: false }).then(( valid ) => { self.APP.sendPanelData( dataContext, valid ); });
    });
    */
});

Template.record_properties_pane.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
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
            mdClassesContent: Meteor.APP.Pages.current.page().get( 'theme' ),
            mdTitle: pwixI18n.label( I18N, 'organizations.properties.managers_modal' ),
            selected: self.item.get().DYN.managers || [],
            update( selected ){
                // get the item updated
                self.item.get().DYN.managers = selected;
                // get the form updated
                instance.APP.form.get().setField( 'managers', self.item.get());
                // advertize parents
                instance.$( '.c-organization-properties-pane' ).trigger( 'panel-data', {
                    emitter: 'managers',
                    id: self.vtpid,
                    ok: true,
                    data: selected
                });
            }
        });
    },

    // input checks
    'input .c-organization-properties-pane'( event, instance ){
        const dataContext = this;
        if( !Object.keys( event.originalEvent ).includes( 'FormChecker' ) || event.originalEvent['FormChecker'].handled !== true ){
            instance.APP.form.get().inputHandler( event ).then(( valid ) => { instance.APP.sendPanelData( dataContext, valid ); });
        }
    },

    // ask for clear the panel
    'iz-clear-panel .c-organization-properties-pane'( event, instance ){
        instance.APP.form.get().clear();
    }
});
