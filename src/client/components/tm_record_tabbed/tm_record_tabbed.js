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
import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import { Records } from '../../../common/collections/records/index.js';

import './tm_record_tabbed.html';

const logger = Logger.get();

Template.tm_record_tabbed.onCreated( function(){
    const self = this;
    //logger.debug( this, Template.currentData());

    self.TM = {
        fields: {
            // 'js' css selectors are chosen so that indicators are positionned inside of the fieldset
            effectStart: {
                js: '.js-start .date-container',
                dom: '.js-start .js-date-input',
            },
            effectEnd: {
                js: '.js-end .date-container',
                dom: '.js-end .js-date-input',
            }
        },
        // the Checker instance
        checker: new ReactiveVar( null ),
        // the tabs for this record
        parmsRecord: new ReactiveVar( {} ),
        // the ValidityFieldset parameters
        parmsValidity: new ReactiveVar( {} ),
        prevTabs: null,

        // whether the new computed list of tabs is the same than the previous one ?
        //  comparison must be deep, but WITHOUT the data context
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
    self.autorun( async () => {
        const dc = Template.currentData();
        if( dc.index < dc.entity.get().DYN.records.length ){
            const fieldSet = Records.fieldSet.get();
            let tabs = [
                {
                    name: 'tenant_record_properties_tab',
                    navLabel: pwixI18n.label( I18N, 'records.panel.properties_tab' ),
                    paneTemplate: 'tm_record_properties_tab',
                    paneData: {
                        entity: dc.entity,
                        index: dc.index,
                        checker: dc.checker
                    }
                }, {
                    name: 'tenant_record_notes_tab',
                    navLabel: pwixI18n.label( I18N, 'panel.notes_tab' ),
                    paneTemplate: 'tm_record_notes_tab',
                    paneData: {
                        item: dc.entity.get().DYN.records[dc.index],
                        checker: dc.checker
                    }
                }
            ];
            const opts = TenantsManager._editorOptions.get();
            if( opts.recordsTabsFn ){
                tabs = await opts.recordsTabsFn( tabs, {
                    entity: dc.entity,
                    index: dc.index,
                    checker: dc.checker
                });
            }
            // prevent useless rebuild if tabs are the same
            if( !self.TM.tabsEqual( tabs )){
                self.TM.parmsRecord.set({
                    name: 'tenants_manager_tm_record_tabbed_'+dc.index,
                    tabs: tabs
                });
            }
        } else {
            logger.info( 'unexpected index', dc.index );
            self.TM.parmsRecord.set( null );
        }
    });

    // prepare the validity fieldset parms
    self.autorun(() => {
        const dc = Template.currentData();
        if( dc.index < dc.entity.get().DYN.records.length ){
            const parms = {
                // this is a debug facility not needed in any case just to be able to display the current index in the component
                index: dc.index,
                startDate: dc.entity.get().DYN.records[dc.index].get().effectStart,
                endDate: dc.entity.get().DYN.records[dc.index].get().effectEnd
            };
            //logger.debug( 'index', dc.index, 'parmsValidity', parms );
            self.TM.parmsValidity.set( parms );
        } else {
            logger.info( 'unexpected index', dc.index );
            self.TM.parmsValidity.set( null );
        }
    });
});

Template.tm_record_tabbed.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    let running = false;
    self.autorun(( comp ) => {
        const dataContext = Template.currentData();
        if( dataContext.index < dataContext.entity.get().DYN.records.length ){
            const parentChecker = dataContext.checker.get();
            let checker = self.TM.checker.get();
            if( parentChecker && !checker && !running ){
                running = true;
                Tracker.nonreactive(() => {
                    checker = new Forms.Checker( self );
                    checker.init({
                        parentChecker: parentChecker,
                        panel: {
                            fields: self.TM.fields,
                            set: Records.fieldSet.get()
                        },
                        data: {
                            entity: dataContext.entity,
                            index: dataContext.index
                        }
                    }).then(() => {
                        self.TM.checker.set( checker );
                        comp.stop();
                    });
                });
            }
        } else {
            self.TM.checker.set( null );
        }
    });
});

Template.tm_record_tabbed.helpers({
    // data context for the record tabbed panes
    parmsRecord(){
        const parms = Template.instance().TM.parmsRecord.get();
        //logger.debug( 'parmsRecord', parms );
        return parms;
    },

    // data context for ValidityFieldset
    parmsValidity(){
        const parms = Template.instance().TM.parmsValidity.get()
        //logger.debug( 'parmsValidity', parms );
        return parms;
    }
});
