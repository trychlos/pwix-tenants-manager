/*
 * pwix:tenants-manager/src/client/components/TenantEditPanel/TenantEditPanel.js
 *
 * Tenant editor.
 *
 *  This is the top template of the edition hierarchy for the tenant:
 *
 *    TenantEditPanel                               this one: manage the events
 *     |
 *     +- Tabbed                                    manage both the entity tabs and the validities
 *     |   |
 *     |   +- entity_properties_pane
 *     |   |
 *     |   +- NotesEdit                             entity notes
 *     |   |
 *     |   +- entity_validities_pane
 *     |       |
 *     |       +- ValidityTabbed                        manage the validities with one pane per validity period
 *     |           |
 *     |           +- record_tabbed                         the record edition panel, as a tabbed component
 *     |           |   |
 *     |           |   +- Tabbed
 *     |           |       |
 *     |           |       +- record_properties_pane
 *     |           |       +- NotesEdit                 record notes
 *     |           |
 *     |           +- ValidityFieldset
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

import { Entities } from '../../../common/collections/entities/index.js';

import '../entity_properties_pane/entity_properties_pane.js';
import '../entity_validities_pane/entity_validities_pane.js';
import '../record_properties_pane/record_properties_pane.js';
import '../record_tabbed/record_tabbed.js';

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
    //  we want a clone deep of the provided item, so that we are able to cancel the edition without keeping any sort of data
    //  and we want ReactiveVar's both for every record and for the entity
    self.autorun(() => {
        const dup = _.cloneDeep( Template.currentData().item || { DYN: { managers: [], records: [{}] }});
        let records = [];
        dup.DYN.records.forEach(( it ) => {
            records.push( new ReactiveVar( it ));
        });
        dup.DYN.records = records;
        self.TM.item.set( dup );
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

    // parms to FormsMessager
    parmsMessager(){
        return {
            ...this,
            messager: Template.instance().TM.messager
        };
    },

    // parms to entity_properties_pane component
    parmsTabbed(){
        TM = Template.instance().TM;
        const paneData = {
            ...this,
            item: TM.item,
            checker: TM.checker
        };
        const notesField = Entities.fieldSet.get().byName( 'notes' );
        const tabs = [
            {
                tabid: 'entity_properties_tab',
                paneid: 'entity_properties_pane',
                navLabel: pwixI18n.label( I18N, 'tabs.entity_properties_title' ),
                paneTemplate: 'entity_properties_pane',
                paneData: paneData
            },
            {
                tabid: 'entity_notes_tab',
                paneid: 'entity_notes_pane',
                navLabel: pwixI18n.label( I18N, 'tabs.entity_notes_title' ),
                paneTemplate: 'NotesEdit',
                paneData: {
                    ...paneData,
                    field: notesField
                }
            },
            {
                tabid: 'entity_validities_tab',
                paneid: 'entity_validities_pane',
                navLabel: pwixI18n.label( I18N, 'tabs.entity_validities_title' ),
                paneTemplate: 'entity_validities_pane',
                paneData: {
                    ...this,
                    entity: TM.item,
                    checker: TM.checker,
                    template: 'record_tabbed',
                    withValidities: true
                }
            }
        ];
        return {
            tabs: tabs
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
