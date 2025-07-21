/*
 * pwix:tenants-manager/src/client/components/tm_entity_properties_pane/tm_entity_properties_pane.js
 *
 * Edit the common part of the tenant's entity.
 *
 * Parms:
 * - item: a ReactiveVar which holds the tenant entity to edit
 * - checker: the parent Checker which manages the dialog
 */

import _ from 'lodash';

import { Forms } from 'meteor/pwix:forms';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Entities } from '../../../common/collections/entities/index.js';

import './tm_entity_properties_pane.html';

Template.tm_entity_properties_pane.onCreated( function(){
    const self = this;

    self.TM = {
        // the Checker instance
        checker: new ReactiveVar( null )
    };
});

Template.tm_entity_properties_pane.onRendered( function(){
    const self = this;

    // initialize the Checker for this panel as soon as we get the parent Checker
    self.autorun(() => {
        const fields = {
            label: {
                js: '.js-label'
            }
        };
        const parentChecker = Template.currentData()?.checker.get();
        const checker = self.TM.checker.get();
        if( parentChecker && !checker ){
            self.TM.checker.set( new Forms.Checker( self, {
                parent: parentChecker,
                panel: new Forms.Panel( fields, Entities.fieldSet.get()),
                data: {
                    item: Template.currentData().item
                }
            }));
        }
    });
});

Template.tm_entity_properties_pane.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // for label
    itFor( label ){
        return 'entity_properties_'+label;
    }
});
