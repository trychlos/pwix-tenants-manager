/*
 * pwix:tenants-manager/src/client/components/record_tabbed/record_tabbed.js
 *
 * We have one record_tabbed component per currently edited validity period,
 *  and, as a matter of fact, there is a 1-to-1 relation between record_tabbed and the corresponding tab inside of validities_tabbed
 * Gathers here organization_properties_pane, validities_fieldset and notes_panel datas.
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - record: the entity record currently being edited
 * - checker: the Checker which manages the parent component
 *
 * Because record_tabbed, which hosts tenants properties as tabs, is itself hosted inside of ValidityTabbed component with one tab per validity period,
 *  we identify each validity period through the tab identifier allocated by the Tabbed parent of this record_tabbed.
 */

import _ from 'lodash';

import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Records } from '../../../common/collections/records/index.js';

import './record_tabbed.html';

Template.record_tabbed.onCreated( function(){
    const self = this;

    self.TM = {
        fields: {
            effectStart: {
                js: '.js-start input',
            },
            effectEnd: {
                js: '.js-end input',
            }
        },
        // the pane identifier of this validity period - must be a ReactiveVar as Blaze helpers are run first before view is fully rendered
        tabId: new ReactiveVar( null ),

        // send the panel data to the parent
        sendPanelData( dataContext, valid ){
            if( _.isBoolean( valid )){
                self.$( '.c-organization-tabbed' ).trigger( 'panel-data', {
                    emitter: 'validity',
                    id: dataContext.vtpid,
                    ok: valid,
                    data: self.TM.checker.get().getForm()
                });
            }
        }
    };

    // set the tab identifier of this validity record (as a ReactiveVar as tabs may be re-identified by coreTabbedTemplate when validities are changed)
    self.autorun(() => {
        self.TM.tabId.set( Template.currentData().tabbedTabId );
    });

    // tracking the tab identifier
    self.autorun(() => {
        //console.debug( 'setting tabId to', self.TM.tabId.get());
    });

    // have an item ReactiveVar to be passed to all child panes
    self.autorun(() => {
        self.TM.itemRv.set( Template.currentData().item );
    });

    // tracking notes of the current item
    self.autorun(() => {
        //console.debug( 'edited', Template.currentData().edited.get());
        //console.debug( 'item', Template.currentData().item );
    });
});

Template.record_tabbed.onRendered( function(){
    const self = this;

    // initialize the FormChecker for this panel
    self.autorun(() => {
        self.TM.checker.set( new CoreApp.FormChecker( self, self.TM.fields, {
            checks: Organizations,
            entityChecker: Template.currentData().entityChecker
        }));
    });

    // set data inside of an autorun so that it is reactive to datacontext changes
    // initialize the display (check indicators) - let the error messages be displayed here: there should be none (though may be warnings)
    self.autorun(() => {
        const dataContext = Template.currentData();
        self.TM.checker.get().setData({
            edited: dataContext.edited,
            item: self.TM.itemRv
        });
        self.TM.checker.get().setForm( dataContext.item );
        self.TM.checker.get().check({ update: false }).then(( valid ) => { self.TM.sendPanelData( dataContext, valid ); });
    });
});

Template.record_tabbed.helpers({
    // data context for the record tabbed panes
    parmsRecord(){
        const dataContext = this;
        const TM = Template.instance().TM;
        const notes = Records.fieldSet.get().byName( 'notes' );
        return {
            tabs: [
                {
                    navLabel: pwixI18n.label( I18N, 'records.panel.properties_tab' ),
                    paneTemplate: 'record_properties_pane',
                    paneData: {
                        item: dataContext.entity,
                        checker: dataContext.checker,
                        vtpid: TM.tabId.get()
                    }
                },
                {
                    navLabel: pwixI18n.label( I18N, 'organizations.panel.urls_tab' ),
                    paneTemplate: 'organization_urls_pane',
                    paneData: {
                        item: dataContext.entity,
                        checker: dataContext.checker,
                        vtpid: TM.tabId.get()
                    }
                },
                {
                    navLabel: pwixI18n.label( I18N, 'organizations.panel.logo_tab' ),
                    paneTemplate: 'organization_logo_pane',
                    paneData: {
                        item: dataContext.entity,
                        checker: dataContext.checker,
                        vtpid: TM.tabId.get()
                    }
                },
                {
                    navLabel: pwixI18n.label( I18N, 'panel.notes_tab' ),
                    paneTemplate: 'NotesEdit',
                    paneData(){
                        return {
                            item: dataContext.record,
                            field: notes
                        };
                    }
                },
                {
                    //navLabel: userNotes.toForm().title,
                    paneTemplate: 'NotesEdit',
                    paneData(){
                        return {
                            item: dataContext.item,
                            field: userNotes
                        };
                    }
                }
            ],
            name: 'record_tabbed'
        }
    },

    // data context for ValidityFieldset
    parmsValidity(){
        return {
            startDate: this.item.effectStart,
            endDate: this.item.effectEnd
        };
    }
});

Template.record_tabbed.events({
    // input checks
    //  happens that this handler is "above" the other panels in the DOM hierarchy - we so get all 'input' events here
    //  the FormChecker will return a null Promise
    'input .c-organization-tabbed'( event, instance ){
        const dataContext = this;
        if( !Object.keys( event.originalEvent ).includes( 'FormChecker' ) || event.originalEvent['FormChecker'].handled !== true ){
            instance.TM.checker.get().inputHandler( event ).then(( valid ) => { instance.TM.sendPanelData( dataContext, valid ); });
        }
    },

    // this component is expected to 'know' which of its subcomponents uses or not a FormChecker.
    //  those who are using FormChecker directly update the edited array
    //  we have to manage others
    'panel-data .c-organization-tabbed'( event, instance, data ){
        if( data.id ){
            //console.debug( event, data );
            if( data.id === instance.TM.tabId.get()){
                switch( data.emitter ){
                    case 'notes':
                        this.item.notes = data.data;
                        break;
                }
            }
            // let bubble the event to be handled by organization_edit
        } else {
            console.warn( 'got panel-data event with id=null', data );
            return false;
        }
    }
});
