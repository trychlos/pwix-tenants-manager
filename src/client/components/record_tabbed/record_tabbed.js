/*
 * pwix:tenants-manager/src/client/components/record_tabbed/record_tabbed.js
 *
 * We have one record_tabbed component per currently edited validity period,
 *  and, as a matter of fact, there is a 1-to-1 relation between record_tabbed and the corresponding tab inside of validities_tabbed
 * Gathers here organization_properties_pane, validities_fieldset and notes_panel datas.
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - record: the entity record currently being edited as a ReactiveVar
 * - checker: the Forms.Checker which manages the parent component
 *
 * Because record_tabbed, which hosts tenants properties as tabs, is itself hosted inside of ValidityTabbed component with one tab per validity period,
 *  we identify each validity period through the tab identifier allocated by the ValidityTabbed (which happens to be the Tabbed parent of this record_tabbed).
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Records } from '../../../common/collections/records/index.js';

import './record_tabbed.html';

Template.record_tabbed.onCreated( function(){
    const self = this;
    //console.debug( this );

    self.TM = {
        // the Checker instance
        checker: new ReactiveVar( null ),
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

    // tracking notes of the current item
    self.autorun(() => {
        //console.debug( 'edited', Template.currentData().edited.get());
        //console.debug( 'item', Template.currentData().item );
    });
});

Template.record_tabbed.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const fields = {
            effectStart: {
                js: '.js-start input',
            },
            effectEnd: {
                js: '.js-end input',
            }
        };
        const parentChecker = Template.currentData().checker.get();
        const checker = self.TM.checker.get();
        if( parentChecker && !checker ){
            self.TM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                panel: new Forms.Panel( fields, Records.fieldSet.get()),
                data: {
                    item: Template.currentData().record,
                    entity: Template.currentData().entity
                }
            }));
        }
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
                        entity: dataContext.entity,
                        record: dataContext.record,
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
                }
            ],
            name: 'record_tabbed'
        }
    },

    // data context for ValidityFieldset
    parmsValidity(){
        return {
            startDate: this.record.get().effectStart,
            endDate: this.record.get().effectEnd
        };
    }
});
