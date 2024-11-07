/*
 * pwix:tenants-manager/src/client/components/tm_entity_validities_pane/tm_entity_validities_pane.js
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

import './tm_entity_validities_pane.html';

Template.tm_entity_validities_pane.onCreated( function(){
    const self = this;

    self.TM = {
        // the Checker instance
        checker: new ReactiveVar( null )
    };
});

Template.tm_entity_validities_pane.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const parentChecker = Template.currentData().checker?.get();
        const checker = self.TM.checker.get();
        if( parentChecker && !checker ){
            self.TM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                data: {
                    item: Template.currentData().item
                }
            }));
        }
    });
});

Template.tm_entity_validities_pane.helpers({
    // manage the ValidityTabbed panel
    parmsValidities(){
        return {
            ...this,
            checker: Template.instance().TM.checker,
            name: 'tenants_manager_entity_validities'
        };
    }
});

Template.tm_entity_validities_pane.events({
    // ask for clear the panel
    'iz-clear-panel .tm-entity-validities-pane'( event, instance ){
        instance.TM.checker.get().clear();
    }
});
