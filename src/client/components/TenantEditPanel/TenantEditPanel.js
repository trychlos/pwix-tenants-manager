/*
 * pwix:tenants-manager/src/client/components/TenantEditPanel/TenantEditPanel.js
 *
 * Tenant editor.
 *
 *  This is the top template of the edition hierarchy for the tenant:
 *
 *    TenantEditPanel                               this one: manage the events
 *     |
 *     +- Tabbed                                    manage both the entity-level tabs and the validity periods
 *     |   |
 *     |   +- tm_entity_validities_tab              a pane which hosts all validity periods
 *     |   |   |
 *     |   |   +- ValiditiesTabbed                  manage the validities with one pane per validity period
 *     |   |       |
 *     |   |       +- Tabbed
 *     |   |       |   |
 *     |   |       |   +- tm_record_tabbed          the record edition tab, as a tabbed component
 *     |   |       |   |   |
 *     |   |       |   |   +- Tabbed
 *     |   |       |   |       |
 *     |   |       |   |       +- tm_record_properties_tab
 *     |   |       |   |       |   |
 *     |   |       |   |       |   +- TenantRecordPropertiesPanel
 *     |   |       |   |       |
 *     |   |       |   |       +- NotesEdit             record notes
 *     |   |       |   |
 *     |   |       |   +- ValidityFieldset
 *     |   |       |
 *     |   |       +- validity_band
 *     |   |
 *     |   +- tm_entity_properties_tab             (unused)
 *     |   |                                        is supposed to hosts properties of the entity itself
 *     |   |
 *     |   +- tm_entity_scoped_tab                 the accounts which have a role for this tenant
 *     |   |
 *     |   +- NotesEdit                             entity notes
 *     |
 *     +- Forms.Messager                            the messages area
 *
 *  This template hierarchy can run inside of a plain page or of a modal; this is up to the caller, and dynamically identified here.
 *
 * Parms:
 * - item: the to-be-edited entity item, null when new
 *      including DYN.managers and DYN.records arrays
 *      this item will be left unchanged until panel submission
 * - checker: a ReactiveVar which holds the parent Checker, may be false if none
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { Logger } from 'meteor/pwix:logger';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tolert } from 'meteor/pwix:tolert';
import { Tracker } from 'meteor/tracker';
import { UIUtils } from 'meteor/pwix:ui-utils';
import { Validity } from 'meteor/pwix:validity';

import { Tenants } from '../../../common/collections/tenants/index.js';
import { Entities } from '../../../common/collections/entities/index.js';

// not used at the moment as we do not want manage any data at the entity level (estimating that notes is more than enough)
//import '../tm_entity_properties_tab/tm_entity_properties_tab.js';

import '../tm_entity_notes_tab/tm_entity_notes_tab.js';
import '../tm_entity_scoped_tab/tm_entity_scoped_tab.js';
import '../tm_entity_validities_tab/tm_entity_validities_tab.js';
import '../tm_record_notes_tab/tm_record_notes_tab.js';
import '../tm_record_properties_tab/tm_record_properties_tab.js';
import '../tm_record_tabbed/tm_record_tabbed.js';

import './TenantEditPanel.html';

const logger = Logger.get();

Template.TenantEditPanel.onCreated( function(){
    const self = this;
    //logger.debug( this );

    self.TM = {
        // the global Checker for this modal
        checker: new ReactiveVar( null ),
        // the global Message zone for this modal
        messager: new Forms.Messager(),
        // whether the item is a new one ?
        isNew: new ReactiveVar( false ),
        // the original (unchanged) item
        orig: null,
        // the item to be edited (a deep copy of the original)
        item: new ReactiveVar( null ),
        // whether we are running inside of a Modal
        isModal: new ReactiveVar( false ),
        // whether we have some changes in the dialog
        //  historic behavior is to default to true, defaulting to false only if we want follow the item changes
        hasChanges: new ReactiveVar( !TenantsManager._editorOptions.get().withCloseButtonWhileNotModified ),
        // the tabs, maybe modified by the application
        entityTabs: new ReactiveVar( null )
    };

    // provided item = entity+records
    self.autorun(() => {
        const item = Template.currentData().item;
        // keep the initial 'new' state
        self.TM.isNew.set( _.isNil( item ));
        // setup the item to be edited
        //  we want a clone deep of the provided item, so that we are able to cancel the edition without keeping any sort of data
        //  and we want ReactiveVar's both for every record and for the entity
        const dup = _.cloneDeep( item || { DYN: { managers: [], closest: {}, records: [{}] }});
        let records = [];
        dup.DYN.records.forEach(( it ) => {
            records.push( new ReactiveVar( it ));
        });
        dup.DYN.records = records;
        self.TM.item.set( dup );
        // keep the original item as a comparable copy
        self.TM.orig = Tenants.comparable( item );
        //logger.debug( 'orig', self.TM.orig );
    });

    // track the edited item
    self.autorun(() => {
        //logger.debug( 'effectEnd', self.TM.item.get().DYN.records[0].get().effectEnd );
    });

    // compute the tabs to be displayed
    self.autorun( async () => {
        const dc = Template.currentData();
        // the standard validities tab
        let tabs = [
            {
                name: 'tenant_entity_validities_tab',
                navLabel: pwixI18n.label( I18N, 'tabs.entity_validities_title' ),
                paneTemplate: 'tm_entity_validities_tab',
                paneData: {
                    ...dc,
                    entity: self.TM.item,
                    checker: self.TM.checker,
                    template: 'tm_record_tabbed',
                    withValidities: TenantsManager.configure().withValidities
                }
            }, {
                name: 'tenant_entity_scoped_tab',
                navLabel: pwixI18n.label( I18N, 'tabs.entity_scoped_title' ),
                paneTemplate: 'tm_entity_scoped_tab',
                paneData: {
                    ...dc,
                    entity: self.TM.item,
                    checker: self.TM.checker
                }
            }, {
                name: 'tenant_entity_notes_tab',
                navLabel: pwixI18n.label( I18N, 'tabs.entity_notes_title' ),
                paneTemplate: 'tm_entity_notes_tab',
                paneData: {
                    ...dc,
                    item: self.TM.item,
                    isNew: self.TM.isNew.get(),
                    checker: self.TM.checker
                }
            }
        ];
        let fn = dc.entitiesTabsFn;
        if( !fn ){
            const opts = TenantsManager._editorOptions.get();
            fn = opts.entitiesTabsFn;
        }
        if( fn ){
            check( fn, Function );
            tabs = await fn( tabs, {
                entity: self.TM.item,
                checker: self.TM.checker
            });
        }
        self.TM.entityTabs.set( tabs );
    });
});

Template.TenantEditPanel.onRendered( function(){
    const self = this;

    // whether we are running inside of a Modal
    self.autorun(() => {
        self.TM.isModal.set( self.$( '.TenantEditPanel' ).parent().hasClass( 'modal-body' ));
    });

    // set the modal target
    self.autorun(() => {
        if( self.TM.isModal.get()){
            Modal.topmost().set({
                target: self.$( '.TenantEditPanel' )
            });
        }
    });

    // allocate a Checker
    //  note that this is a topmost template only when we are running inside of a modal - else have to wait for a parent checker
    let running = false;
    self.autorun(( comp ) => {
        const dc = Template.currentData();
        const isModal = self.TM.isModal.get();
        let checker = self.TM.checker.get();
        if( !checker && ( isModal || dc.checker === false ) && !running ){
            running = true;
            Tracker.nonreactive(() => {
                if( isModal ){
                }
                checker = new Forms.Checker( self );
                //logger.debug( 'checker', checker.iSeq());
                checker.init({
                    name: 'TenantEditPanel',
                    messager: self.TM.messager,
                    async onValidityChangeRegisterFn( valid ){
                        // if isModal
                        //   enable/disable the OK button
                        // else
                        //   enable/disable the Save button
                        if( isModal ){
                            const modal = Modal.topmost();
                            const $btn = modal.buttonFind( Modal.C.Button.OK );
                            if( $btn && $btn.length ){
                                modal.set({ buttons: { id: Modal.C.Button.OK, enabled: valid }});
                            }
                        } else {

                        }
                    },
                    // update the modal buttons 'Close' while there is no modif, then 'Cancel' and 'OK'
                    // when evaluating diffs, only consider entity/records relative data
                    async onFieldUpdateRegisterFn( data, opts ){
                        //  if isModal
                        //    if modifiedOnUpdate
                        //       if hasChanges and isValid
                        //          set cancel/ok buttons
                        //       else
                        //          set reset/close buttons
                        //    else
                        //      does nothing (buttons are cancel/ok by default)
                        //  else
                        //    if modifiedOnUpdate
                        //       if hasChanges and isValid
                        //          enable save button
                        //       else
                        //          disable save button
                        //    else
                        //      disable save button
                        if( TenantsManager.configure().modifiedOnUpdate ){
                            if( isModal ){
                                let hasChanges = false;
                                let buttons = [ Modal.C.ButtonExt.RESET, Modal.C.Button.CLOSE ];
                                const item = Tenants.comparable( self.TM.item.get());
                                //logger.debug( 'item', item );
                                if( !_.isEqual( item, self.TM.orig )){
                                    //Tenants.explainDifferences( self.TM.orig, item );
                                    hasChanges = true;
                                    buttons = [ Modal.C.ButtonExt.RESET, Modal.C.Button.CANCEL, Modal.C.Button.OK ];
                                }
                                if( hasChanges !== self.TM.hasChanges.get()){
                                    const modal = Modal.topmost();
                                    modal.set({
                                        buttons: buttons
                                    });
                                    self.TM.hasChanges.set( hasChanges );
                                    await UIUtils.DOM.waitFor( '#'+modal.id()+' .modal-footer [data-md-btn-id="'+Modal.C.Button.OK+'"]' );
                                    // normally done by onValidityChangeRegisterFn() unless the two functions are triggered too closely 
                                    // (e.g. when we erase a mandatory field) and the button doesn't have time to appear before onValidityChangeRegisterFn() is triggered
                                    _setOKButton();
                                }
                            }
                        }
                    }
                }).then(() => {
                    self.TM.checker.set( checker );
                    comp.stop();
                });
            });
        }
    });

    // track tenant validity status
    self.autorun(() => {
        const checker = self.TM.checker.get();
        if( checker ){
            //logger.debug( 'valid', checker.validity());
        }
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

    // parms to tm_entity_properties_tab component
    parmsTabbed(){
        return {
            name: 'tenants_manager_EditPanel',
            tabs: Template.instance().TM.entityTabs.get(),
            activateTab: Template.instance().TM.isNew.get() ? 0 : undefined
        };
    },

    // the styling of the Save button depends of whether we want manage up-to-time updates
    //  i.e. if we want modified activated only when there is something to modify (which is a bit costly)
    saveClass(){
        const followChanges = TenantsManager._editorOptions.get().withCloseButtonWhileNotModified;
        return followChanges ? ( Template.instance().TM.hasChanges.get() ? 'btn-warning' : 'disabled btn-outline-warning' ) : 'btn-warning';
    },

    // when have a save button, whether to enable or disable it ?
    saveDisabled(){
        return '';
    },

    // when in a page, have a create or save button
    saveLabel(){
        return pwixI18n.label( I18N, Template.instance().TM.isNew.get() ? 'panel.create_btn' : 'panel.save_btn' );
    }
});

Template.TenantEditPanel.events({
    // handle reset button when we are in a modal
    'md-click .TenantEditPanel'( event, instance, data ){
        //logger.debug( event, data );
        if( data.button.id === Modal.C.Button.RESET ){
            //instance.$( event.currentTarget ).trigger( 'iz-submit' );
        }
    },

    // submit
    //  event triggered in case of a page
    '.js-save .TenantEditPanel'( event, instance, data ){
        instance.$( event.currentTarget ).trigger( 'iz-submit' );
    },

    // submit
    //  event triggered in case of a modal
    'md-click .TenantEditPanel'( event, instance, data ){
        //logger.debug( event, data );
        if( data.button.id === Modal.C.Button.OK ){
            instance.$( event.currentTarget ).trigger( 'iz-submit' );
        }
    },

    // submit
    'iz-submit .TenantEditPanel'( event, instance ){
        //logger.debug( event, instance );
        const item = instance.TM.item.get();
        const label = Validity.closest( item ).record.label || '';
        Meteor.callAsync( 'pwix.TenantsManager.m.Tenants.upsert', item )
            .then(( res ) => {
                //logger.debug( 'res', res );
                // does nothing at the moment
                return Meteor.callAsync( 'pwix.TenantsManager.m.Tenants.setManagers', item )
            })
            .then(() => {
                Tolert.success( pwixI18n.label( I18N, instance.TM.isNew.get() ? 'edit.new_success' : 'edit.edit_success', label ));
                if( instance.TM.isModal.get()){
                    Modal.topmost().close();
                } else {
                    instance.$( '.c-record-properties-pane' ).trigger( 'iz-clear-panel' );
                    instance.$( '.NotesEdit' ).trigger( 'iz-clear-panel' );
                }
            })
            .catch(( e ) => {
                logger.error( e );
                Tolert.error( pwixI18n.label( I18N, 'edit.error' ));
            });
    },

    // validity periods management
    'validity-period-created .TenantEditPanel'( event, instance, data ){
        //logger.debug( event, data );
    },
    'validity-period-left-merged .TenantEditPanel'( event, instance, data ){
        //logger.debug( event, data );
    },
    'validity-period-right-merged .TenantEditPanel'( event, instance, data ){
        //logger.debug( event, data );
    },
    'validity-period-removed .TenantEditPanel'( event, instance, data ){
        //logger.debug( event, data );
    }
});
