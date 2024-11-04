/*
 * pwix:tenants-manager/src/client/components/entity_properties_pane/entity_properties_pane.js
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

import './entity_properties_pane.html';

Template.entity_properties_pane.onCreated( function(){
    const self = this;

    self.TM = {
        // the Checker instance
        checker: new ReactiveVar( null )
    };
});

Template.entity_properties_pane.onRendered( function(){
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

Template.entity_properties_pane.helpers({
    // string translation
    i18n( arg ){
        return pwixI18n.label( I18N, arg.hash.key );
    },

    // for label
    itFor( label ){
        return 'entity_properties_'+label;
    },

    label(){
        return this.item.get().label || '';
    }
});

Template.entity_properties_pane.events({
    // edit the managers
    'click .js-edit-managers'( event, instance ){
        const self = this;
        Modal.run({
            mdBody: 'accounts_select',
            mdButtons: [{ id: Modal.C.Button.NEW, classes: 'btn-outline-primary me-auto' }, Modal.C.Button.CANCEL, { id: Modal.C.Button.OK, type: 'submit' }],
            mdClasses: 'modal-lg',
            mdClassesContent: Meteor.TM.Pages.current.page().get( 'theme' ),
            mdTitle: pwixI18n.label( I18N, 'organizations.properties.managers_modal' ),
            selected: self.item.get().DYN.managers || [],
            update( selected ){
                // get the item updated
                self.item.get().DYN.managers = selected;
                // get the form updated
                instance.TM.form.get().setField( 'managers', self.item.get());
                // advertise parents
                instance.$( '.c-organization-properties-pane' ).trigger( 'panel-data', {
                    emitter: 'managers',
                    id: self.vtpid,
                    ok: true,
                    data: selected
                });
            }
        });
    },
/*
    // input checks
    'input .c-organization-properties-pane'( event, instance ){
        const dataContext = this;
        if( !Object.keys( event.originalEvent ).includes( 'FormChecker' ) || event.originalEvent['FormChecker'].handled !== true ){
            instance.TM.form.get().inputHandler( event ).then(( valid ) => { instance.TM.sendPanelData( dataContext, valid ); });
        }
    },

    // ask for clear the panel
    'iz-clear-panel .c-organization-properties-pane'( event, instance ){
        instance.TM.form.get().clear();
    }
        */
});
