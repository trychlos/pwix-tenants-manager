/*
 * pwix:tenants-manager/src/common/collections/tenants/tabular.js
 *
 * The Tenants Manager tabular displays the closest record for each tenant, but:
 * - lowest start end highest end effect dates are displayed
 * - a particular class is used when the value is not the same among all the records
 * - a badge is added when there is more than one record
 */

import _ from 'lodash';

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';
import { Tracker } from 'meteor/tracker';

import { Entities } from '../entities/index.js';
import { Records } from '../records/index.js';

import { Tenants } from './index.js';

const _entity = async function( data ){
    const entity = Meteor.isClient ? await Meteor.callAsync( 'pwix_tenants_manager_entities_getBy', { _id: data.entity }) : await Entities.server.getBy({ _id: data.entity }, Meteor.userId());
    return entity[0];
};

const _record_label = function( it ){
    return it ? it.label : '';
};

Tracker.autorun(() => {
    if( Entities.collectionReady.get() && Records.collectionReady.get()){

        // build the defined columns indexed by name
        let columns = {};
        let i = 0;
        Tenants.fieldSet.get().names().forEach(( it ) => {
            columns[it] = {
                def: Tenants.fieldSet.get().byName( it ),
                index: i
            };
            i += 1;
        });

        // instanciates the tabular Table
        Tenants.tabular = new Tabular.Table({
            name: 'Tenants',
            collection: Records.collection,
            columns: Tenants.fieldSet.get().toTabular(),
            pub: 'pwix_tenants_manager_tenants_tabular',
            tabular: {
                // have a badge which displays the count of validity records if greater than 1
                // let this array be extended by the calling application
                async buttons(){
                    let buttons = [
                        {
                            where: Tabular.C.Where.BEFORE,
                            buttons: [
                                'dt_count_badge'
                            ]
                        }
                    ];
                    let extend = TenantsManager.configure().tenantButtons;
                    extend = extend ? ( typeof extend === 'function' ? await extend() : extend ) : null;
                    return extend ? buttons.concat( extend ) : buttons;
                },
                async deleteButtonEnabled( it ){
                    return TenantsManager.isAllowed( 'pwix.tenants_manager.feat.delete', null, it );
                },
                // display the organization label instead of the identifier in the button title
                async deleteButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.delete_title', _record_label( it ));
                },
                async deleteConfirmationText( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_text', _record_label( it ));
                },
                async deleteConfirmationTitle( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_title', _record_label( it ));
                },
                async editButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.edit_title', _record_label( it ));
                },
                async editItem( it ){
                    return await _entity( it );
                },
                async infoButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.info_title', _record_label( it ));
                },
                async infoItem( it ){
                    return await _entity( it );
                },
                async infoModalTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.info_modal', _record_label( it ));
                },
            },
            destroy: true,
            order: {
                name: 'entity',
                dir: 'asc'
            },
            // the publication takes care of providing the list of fields which have not the same value among all records
            createdRow( row, data, dataIndex, cells ){
                //console.debug( columns, data );
                // set a different display when a value changes between validity records
                data.DYN.analyze.diffs.forEach(( it ) => {
                    const def = columns[it]?.def;
                    if( def && def.dt_tabular !== false && def.dt_visible !== false ){
                        $( cells[columns[it].index] ).addClass( 'dt-different' );   
                    }
                });
                // display the englobing period as start and end effect dates
                data.effectStart = data.DYN.start;
                data.effectEnd = data.DYN.end;
            }
        });
    }
});
