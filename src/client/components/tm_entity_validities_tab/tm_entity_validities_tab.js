/*
 * pwix:tenants-manager/src/client/components/tm_entity_validities_tab/tm_entity_validities_tab.js
 *
 * Manages a ValidityTabbed tabbed pane, where each pane is a validity period.
 *
 * Parms:
 * - item: a ReactiveVar which holds the tenant entity to edit
 * - checker: the parent Checker
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';

import './tm_entity_validities_tab.html';

Template.tm_entity_validities_tab.onCreated( function(){
    const self = this;

    self.TM = {
        // the Checker instance
        checker: new ReactiveVar( null )
    };
});

Template.tm_entity_validities_tab.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    let running = false;
    self.autorun(( comp ) => {
        const dataContext = Template.currentData();
        const parentChecker = dataContext.checker?.get();
        let checker = self.TM.checker.get();
        if( parentChecker && !checker && !running ){
            running = true;
            Tracker.nonreactive(() => {
                checker = new Forms.Checker( self);
                checker.init({
                    parent: parentChecker,
                    data: {
                        item: Template.currentData().item
                    }
                }).then(() => {
                    self.TM.checker.set( checker );
                    comp.stop();
                });
            });
        }
    });
});

Template.tm_entity_validities_tab.helpers({
    // manage the ValidityTabbed panel
    parmsValidities(){
        return {
            ...this,
            checker: Template.instance().TM.checker,
            name: 'tenants_manager_entity_validities'
        };
    }
});

Template.tm_entity_validities_tab.events({
    // ask for clear the panel
    'iz-clear-panel .tm-entity-validities-tab'( event, instance ){
        instance.TM.checker.get().clearForm();
    }
});
