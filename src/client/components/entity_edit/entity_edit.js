/*
 * pwix:tenants-manager/src/client/components/entity_edit/entity_edit.js
 *
 * Edit the common part of the tenant's entity.
 *
 * Parms:
 * - item: a ReactiveVar which holds the tenant entity to edit
 * - checker: the parent Checker which manages the dialog
 */

import _ from 'lodash';

import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Entities } from '../../../common/collections/entities/index.js';

import './entity_edit.html';

Template.entity_edit.onCreated( function(){
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

    // make sure we have a DYN object
    self.autorun(() => {
        const item = Template.currentData().item.get();
        if( !item.DYN ){
            item.DYN = {};
            Template.currentData().item.set( item );
        }
    });
});

Template.entity_edit.onRendered( function(){
    const self = this;
    const dataContext = Template.currentData();

    // initialize the FormChecker for this panel
    self.autorun(() => {
        self.APP.form.set( new CoreApp.FormChecker({
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
});

Template.entity_edit.helpers({
    // display a check indicator
    fieldCheck( f ){
        const form = Template.instance().APP.form.get();
        return form ? form.getFieldCheck( f ) : '';
    },

    // display a type indicator
    fieldType( f ){
        return Template.instance().APP.fields[f].type || '';
    },

    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // the issuer url
    issuer(){
        return this.item.get().baseUrl ? pwixI18n.label( I18N, 'organizations.properties.issuer_label', Organizations.fn.baseUrl( this.item.get())) : '&nbsp;';
    },
});

Template.entity_edit.events({
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
