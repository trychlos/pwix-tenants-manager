/*
 * pwix:tenants-manager/src/client/components/tm_record_tabbed/tm_record_tabbed.js
 *
 * We have one tm_record_tabbed component per currently edited validity period,
 *  and, as a matter of fact, there is a 1-to-1 relation between tm_record_tabbed and the corresponding tab inside of validities_tabbed
 * Gathers here organization_properties_pane, validities_fieldset and notes_panel datas.
 *
 * Parms:
 * - entity: the currently edited entity as a ReactiveVar
 * - index: the index of the edited record
 * - checker: the Forms.Checker which manages the parent component
 *
 * Because tm_record_tabbed, which hosts tenants properties as tabs, is itself hosted inside of ValidityTabbed component with one tab per validity period,
 *  we identify each validity period through the tab identifier allocated by the ValidityTabbed (which happens to be the Tabbed parent of this tm_record_tabbed).
 * Note too that Validity is able to (is actually built to do that) modify the validity periods. This implies that this tm_record_tabbed may be changed,
 * or even dynamically removed. But due to Blaze latencies and asynchronicities, we may receive here updates for a to-be-destroyed view. So care of that.
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Records } from '../../../common/collections/records/index.js';

import './tm_record_tabbed.html';

Template.tm_record_tabbed.onCreated( function(){
    const self = this;
    //console.debug( this, Template.currentData());

    self.TM = {
        fields: {
            effectStart: {
                js: '.js-start input',
            },
            effectEnd: {
                js: '.js-end input',
            }
        },
        // the Checker instance
        checker: new ReactiveVar( null ),
        // the tabs for this record
        parmsRecord: new ReactiveVar( null ),
        // the ValidityFieldset parameters
        parmsValidity: new ReactiveVar( null ),
        prevTabs: null,

        // whether the new computed list of tabs is the same than the previous one ?
        //  comparison must be deepn, but WITHOUT the data context
        tabsEqual( tabs ){
            let cmptabs = [];
            tabs.forEach(( it ) => {
                let o = { ...it };
                delete o.paneData;
                cmptabs.push( o );
            });
            const equals = _.isEqual( cmptabs, self.TM.prevTabs );
            self.TM.prevTabs = cmptabs;
            return equals;
        }
    };

    // prepare the record tabbed parms
    // MUST prevent a tabs redefinition when the data context changes
    self.autorun(() => {
        const dataContext = Template.currentData();
        if( dataContext.index < dataContext.entity.get().DYN.records.length ){
            const notes = Records.fieldSet.get().byName( 'notes' );
            const paneData = {
                entity: dataContext.entity,
                index: dataContext.index,
                checker: dataContext.checker
            };
            let tabs = [];
            // tabs before the standard
            if( dataContext.recordTabsBefore ){
                if( _.isArray( dataContext.recordTabsBefore )){
                    dataContext.recordTabsBefore.forEach(( tab ) => {
                        tab.paneData = paneData;
                        tabs.push({ ...tab });
                    });
                } else {
                    console.warn( 'expect tabs be an array, got', dataContext.recordTabsBefore );
                }
            }
            // the standard has one 'propeties' tab
            tabs.push({
                name: 'tenant_record_properties_tab',
                navLabel: pwixI18n.label( I18N, 'records.panel.properties_tab' ),
                paneTemplate: 'TenantRecordPropertiesPanel',
                paneData: paneData
            });
            // tabs before 'notes'
            if( dataContext.recordTabs ){
                if( _.isArray( dataContext.recordTabs )){
                    dataContext.recordTabs.forEach(( tab ) => {
                        tab.paneData = paneData;
                        tabs.push({ ...tab });
                    });
                } else {
                    console.warn( 'expect tabs be an array, got', dataContext.recordTabs );
                }
            }
            // standard 'notes'
            tabs.push({
                name: 'tenant_record_notes_tab',
                navLabel: pwixI18n.label( I18N, 'panel.notes_tab' ),
                paneTemplate: 'NotesEdit',
                paneData: {
                    item: dataContext.entity.get().DYN.records[dataContext.index].get(),
                    field: notes
                }
            });
            // tabs at the end
            if( dataContext.recordTabsAfter ){
                if( _.isArray( dataContext.recordTabsAfter )){
                    dataContext.recordTabsAfter.forEach(( tab ) => {
                        tab.paneData = paneData;
                        tabs.push({ ...tab });
                    });
                } else {
                    console.warn( 'expect tabs be an array, got', dataContext.recordTabsAfter );
                }
            }
            if( !self.TM.tabsEqual( tabs )){
                self.TM.parmsRecord.set({
                    name: 'tenants_manager_tm_record_tabbed_'+dataContext.index,
                    tabs: tabs
                });
            }
        } else {
            console.warn( 'pwix:tenants-manager unexpected index', dataContext.index );
            self.TM.parmsRecord.set( null );
        }
    });

    // prepare the validity fieldset parms
    self.autorun(() => {
        const dataContext = Template.currentData();
        if( dataContext.index < dataContext.entity.get().DYN.records.length ){
            const parms = {
                startDate: dataContext.entity.get().DYN.records[dataContext.index].get().effectStart,
                endDate: dataContext.entity.get().DYN.records[dataContext.index].get().effectEnd
            };
            self.TM.parmsValidity.set( parms );
        } else {
            console.warn( 'pwix:tenants-manager unexpected index', dataContext.index );
            self.TM.parmsValidity.set( null );
        }
    });
});

Template.tm_record_tabbed.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const dataContext = Template.currentData();
        if( dataContext.index < dataContext.entity.get().DYN.records.length ){
            const parentChecker = dataContext.checker.get();
            const checker = self.TM.checker.get();
            if( parentChecker && !checker ){
                self.TM.checker.set( new Forms.Checker( self, {
                    parent: parentChecker,
                    panel: new Forms.Panel( self.TM.fields, Records.fieldSet.get()),
                    data: {
                        entity: dataContext.entity,
                        index: dataContext.index
                    }
                }));
            }
        } else {
            self.TM.checker.set( null );
        }
    });
});

Template.tm_record_tabbed.helpers({
    // data context for the record tabbed panes
    parmsRecord(){
        return Template.instance().TM.parmsRecord.get();
    },

    // data context for ValidityFieldset
    parmsValidity(){
        return Template.instance().TM.parmsValidity.get();
    }
});
