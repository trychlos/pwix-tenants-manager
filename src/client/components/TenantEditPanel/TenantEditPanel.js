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
 *     |   +- entity_properties_pane                (unused)
 *     |   |
 *     |   +- NotesEdit                             entity notes
 *     |   |
 *     |   +- entity_validities_pane
 *     |       |
 *     |       +- ValiditiesTabbed                      manage the validities with one pane per validity period
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
 *     +- Forms.Messager                            the messages area
 *
 *  This template hierarchy can run inside of a plain page or of a modal; this is up to the caller, and dynamically identified here.
 *
 * Parms:
 * - item: the to-be-edited entity item, null when new
 *      including DYN.managers and DYN.records arrays
 *      this item will be left unchanged until panel submission
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { Modal } from 'meteor/pwix:modal';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tolert } from 'meteor/pwix:tolert';
import { Validity } from 'meteor/pwix:validity';

import { Entities } from '../../../common/collections/entities/index.js';

// not used at the moment as we do not want manage any data at the entity level (estimating that notes is more than enough)
//import '../entity_properties_pane/entity_properties_pane.js';
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

    // allocate a Checker for this (topmost parent) template
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
                tabid: 'entity_validities_tab',
                paneid: 'entity_validities_pane',
                navLabel: pwixI18n.label( I18N, 'tabs.entity_validities_title' ),
                paneTemplate: 'entity_validities_pane',
                paneData: {
                    ...this,
                    entity: TM.item,
                    checker: TM.checker,
                    template: 'record_tabbed',
                    withValidities: TenantsManager.configure().withValidities
                }
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
            }
        ];
        return {
            tabs: tabs
        };
    }
});

Template.TenantEditPanel.events({
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
        const item = instance.TM.item.get();
        const label = Validity.closest( item ).record.label || '';
        console.debug( 'item', item );
        Meteor.callAsync( 'pwix_tenants_manager_tenants_upsert', item )
            .then(( res ) => {
                //console.debug( 'res', res );
                return Meteor.callAsync( 'pwix_tenants_manager_tenants_set_managers', item )
            })
            .then(() => {
                Tolert.success( pwixI18n.label( I18N, instance.TM.isNew.get() ? 'edit.new_success' : 'edit.edit_success', label ));
                if( instance.TM.isModal.get()){
                    Modal.close();
                } else {
                    instance.$( '.c-record-properties-pane' ).trigger( 'iz-clear-panel' );
                    instance.$( 'NotesEdit' ).trigger( 'iz-clear-panel' );
                }
            })
            .catch(( e ) => {
                console.error( e );
                Tolert.error( pwixI18n.label( I18N, 'edit.error' ));
            });
    }
});
