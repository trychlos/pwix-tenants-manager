/*
 * pwix:tenants-manager/src/client/components/TenantEditPanel/TenantEditPanel.js
 *
 * Tenant editor.
 *
 *  This is the top template of the edition hierarchy for the tenant:
 *
 *    TenantEditPanel                               this one: manage the events
 *     |
 *     +- entity_edit                               edit the common parts of the tenant's entity
 *     |
 *     +- ValidityTabbed                            manage the validities
 *     |   |
 *     |   +- record_tabbed                         the record edition panel, as a tabbed component
 *     |       |
 *     |       +- Tabbed
 *     |       |   |
 *     |       |   +- organization_properties_pane
 *     |       |   +- organization_urls_pane
 *     |       |   +- organization_logo_panel
 *     |       |   +- ext_notes_panel
 *     |       |
 *     |       +- ValidityFieldset
 *     |
 *     +- FormsMessager                             the messages area
 *
 *  This template hierarchy can run inside of a plain page or of a modal; this is up to the caller, and dynamically identified here.
 *
 * Parms:
 * - item: the to-be-edited item, null when new
 *      including DYN.managers and DYN.records arrays
 *      this item will be left unchanged until panel submission
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/pwix:roles';

import '../entity_edit/entity_edit.js';
//import '../record_tabbed/record_tabbed.js';

import './TenantEditPanel.html';

Template.TenantEditPanel.onCreated( function(){
    const self = this;

    self.TM = {
        // the global Checker for this modal
        checker: new ReactiveVar( null ),
        // the global Message zone for this modal
        messager: new Forms.Messager(),
        // whether the item is a new one ?
        isNew: new ReactiveVar( false ),
        // the item to be edited (a deep copy of the original)
        item: new ReactiveVar( null ),
        // whether we are running inside of a Modal
        isModal: new ReactiveVar( false )
    };

    // keep the initial 'new' state
    self.autorun(() => {
        self.TM.isNew.set( _.isNil( Template.currentData().item ));
    });

    // setup the item to be edited
    self.autorun(() => {
        self.TM.item.set( _.cloneDeep( Template.currentData().item || { DYN: { managers: [], records: [] }}));
    });
});

Template.TenantEditPanel.onRendered( function(){
    const self = this;

    // whether we are running inside of a Modal
    self.autorun(() => {
        self.TM.isModal.set( self.$( '.TenantEditPanel' ).closest( '.modal-dialog' ).length > 0 );
    });

    // set the modal target+title
    self.autorun(() => {
        if( self.TM.isModal.get()){
            Modal.set({
                target: self.$( '.TenantEditPanel' )
            });
        }
    });

    // allocate an Checker for this (topmost parent) template
    self.autorun(() => {
        self.TM.checker.set( new Forms.Checker( self, {
            messager: self.TM.messager,
            okFn( valid ){
                if( self.TM.isModal ){
                    Modal.set({ buttons: { id: Modal.C.Button.OK, enabled: valid }});
                }
            }
        }));
    });
});

Template.TenantEditPanel.helpers({
    // text translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // do we run inside of a modal ?
    isModal(){
        return Template.instance().TM.isModal.get();
    },

    // whether we want create a new entity ?
    isNew(){
        return Template.instance().TM.isNew.get();
    },

    // parms to entity_edit component
    parmsEntityEdit(){
        return {
            ...this,
            item: Template.instance().TM.item,
            checker: Template.instance().TM.checker
        };
    },

    // parms to FormsMessager
    parmsMessager(){
        return {
            ...this,
            messager: Template.instance().TM.messager
        };
    },

    // parms for ValidityTabbed
    // the calling data context is completed with:
    //  - to-be-edited item reactive var, may be empty
    //  - the target template
    //  - withValidities
    //  - the template to be rendered for each validity period
    //  - our (topmost) Checker instance
    parmsValidities(){
        return {
            ...this,
            entity: Template.instance().TM.item,
            checker: Template.instance().TM.checker,
            //template: record_tabbed,
            withValidities: true
        };
    }
});

Template.TenantEditPanel.events({
    // this component is expected to 'know' which of its subcomponents uses or not a FormChecker.
    //  those who are using FormChecker directly update the edited item
    //  we have to manage others
    'panel-data .TenantEditPanel'( event, instance, data ){
        //console.debug( 'id', data.id, 'myTabId', instance.TM.tabId.get(), data );
        switch( data.emitter ){
            case 'notes':
                instance.item.get().notes = data.data;
                break;
        }
        // let bubble the event to be handled by client_edit
    },

    // submit
    //  event triggered in case of a modal
    'md-click .TenantEditPanel'( event, instance, data ){
        //console.debug( event, data );
        if( data.button.id === Modal.C.Button.OK ){
            instance.$( event.currentTarget ).trigger( 'iz-submit' );
        }
    },

    // submit
    'iz-submit .TenantEditPanel'( event, instance ){
        //console.debug( event, instance );
        let item = instance.TM.item.get();
        let email = item.emails[0].address;
        // merge all data parts
        Object.keys( instance.TM.dataParts.all()).every(( emitter ) => {
            // ident panel
            if( emitter === 'ident' ){
                ;
            } else if( emitter === 'roles' ){
                item.roles = instance.TM.dataParts.get( emitter ).data;
            } else if( emitter === 'settings' ){
                ;
            } else if( emitter === 'notes' ){
                item.notes = instance.TM.dataParts.get( emitter ).data
            }
            return true;
        });
        console.debug( 'item', item );
        // after the user has been created we get back its internal identifier to be used on updates for other panels
        //  a Promise which resolves to the newly created user account
        const _getAccountAfterCreation = function( email ){
            return Meteor.callPromise( 'account.byEmail', email );
        };
        // whether the user has been just created or is to be updated, other panels are to be considered separately
        const _updateFromPanels = function(){
            // roles panel: replace all roles for the user
            Roles.removeAllRolesFromUser( item._id ).then(( res ) => {
                item.roles.every(( role ) => {
                    const scope = role.scope;
                    Meteor.callPromise( 'Roles.addUsersToRoles', item._id, role._id, scope === 'NONE' ? {} : { scope: scope })
                        .then(( res ) => {
                            //console.debug( 'Roles.addUsersToRoles()', role.doc._id, res );
                        });
                    return true;
                });
            });
            // notes panel
            if( item.notes ){
                Meteor.callPromise( 'account.setAttribute', item._id, { notes: item.notes });
            } else {
                Meteor.callPromise( 'account.clearAttributes', item._id, [ 'notes' ]);
            }
        }
        // when creating a new account, we let the user create several by reusing the same modal
        if( instance.TM.isNew.get()){
            /*
            AccountsUI.Account.createUser({
                username: item.username,
                password: item.password,
                email: email
            }, {
                autoConnect: false,
                successFn(){
                    _getAccountAfterCreation( item.email ).then(( user ) => {
                        if( user ){
                            item._id = user._id;
                            _updateFromPanels();
                        } else {
                            console.warn( 'unable to retrieve the user account', item.email );
                        }
                    });
                }
            });
            */
            instance.$( '.c-account-ident-panel .ac-signup' ).trigger( 'ac-clear-panel' );
            instance.$( '.c-account-roles-panel' ).trigger( 'clear-panel' );
            instance.$( '.c-account-settings-panel' ).trigger( 'clear-panel' );
            instance.$( '.c-notes-panel' ).trigger( 'clear-panel' );
        } else {
            // update users
            Meteor.call( 'account.updateUser', item );
            _updateFromPanels();
            Modal.close();
        }
    }
});
