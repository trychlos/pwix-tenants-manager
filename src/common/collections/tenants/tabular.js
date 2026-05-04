/*
 * pwix:tenants-manager/src/common/collections/tenants/tabular.js
 *
 * The Tenants Manager tabular displays the closest record for each tenant, but:
 * - lowest start end highest end effect dates are displayed
 * - a particular class is used when the value is not the same among all the records
 * - a badge is added when there is more than one record
 */

import _ from 'lodash';

import { Logger } from 'meteor/pwix:logger';
import { pwixI18n } from 'meteor/pwix:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tabular } from 'meteor/pwix:tabular';
import { Tracker } from 'meteor/tracker';

import { Tenants } from './index.js';

import { Entities } from '../entities/index.js';
import { Records } from '../records/index.js';

const logger = Logger.get();

TenantsManager.Tabular = _.merge( {}, TenantsManager.Tabular || {}, {
    // the Tabular.Table instance
    _table: null,

    _buttonsHooks: [],

    // default options
    _defaultOptions(){
        const opts = {
            name: TenantsManager.C.pub.tabular.name,
            collection: Records.collection,
            pub: TenantsManager.C.pub.tabular.publish,
            pwix: {
                async deleteButtonEnabled( it ){
                    const res = await TenantsManager.isAllowed( 'pwix.tenants_manager.fn.delete', Meteor.isClient && Meteor.userId(), it.DYN.entity );
                    return res;
                },
                // display the tenant label instead of the identifier in the button title
                async deleteButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.delete_title', TenantsManager.Tabular._record_label( it ));
                },
                async deleteConfirmationText( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_text', TenantsManager.Tabular._record_label( it ));
                },
                async deleteConfirmationTitle( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_title', TenantsManager.Tabular._record_label( it ));
                },
                async editButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.edit_title', TenantsManager.Tabular._record_label( it ));
                },
                async editItem( it ){
                    return await TenantsManager.Tabular._entity( it );
                },
                async infoButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.info_title', TenantsManager.Tabular._record_label( it ));
                },
                async infoItem( it ){
                    return await TenantsManager.Tabular._entity( it );
                },
                async infoModalTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.info_modal', TenantsManager.Tabular._record_label( it ));
                },
            },
            destroy: true
        };
        return opts;
    },

    // return the entity from a record (is expected to already be in DYN)
    async _entity( data ){
        const entity = Meteor.isClient ? await Meteor.callAsync( 'pwix.TenantsManager.m.Entities.getBy', { _id: data.entity }) : await Entities.s.getBy({ _id: data.entity }, Meteor.userId());
        return entity[0];
    },

    // returns the record label
    _record_label( it ){
        return it ? it.label : '';
    },

    // instanciates the table with the passed-in options
    init( options ){
        const fieldset = Records.fieldSet.get();
        // instanciating a Tabular.Table must be reactive on options and fieldset
        const columns = fieldset.toTabular();
        const indexMap = Tabular.indexMap( columns );
        // instanciation options need to be updated with up-to-date columns
        options = _.merge( options, {
            columns,
            order: [[ indexMap['label'], 'asc' ]],
            // the publication takes care of providing the list of fields which have not the same value among all records
            createdRow( row, data, dataIndex, cells ){
                // set a different display when a value changes between validity records
                data.DYN.analyze.diffs.forEach(( it ) => {
                    const def = columns[it]?.def;
                    if( def && def.tabular !== false && def.dt_visible !== false ){
                        $( cells[columns[it].index] ).addClass( 'dt-different' );   
                    }
                });
                //logger.debug( 'rowData', data );
            }
        });
        // instanciate a new table
        const tabular = new Tabular.Table( options );
        // install our buttons hooks
        tabular.buttonsHooks( TenantsManager.Tabular._buttonsHooks );
        TenantsManager.Tabular._table = tabular;
        return tabular;
    }
});

// setup our buttons hook
// have a badge which displays the count of validity records if greater than 1
TenantsManager.Tabular._buttonsHooks.push( async function( table, buttons ){
    buttons.unshift( 'ValidityCountBadge' );
    return buttons;
});
