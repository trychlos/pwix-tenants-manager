/*
 * pwix:tenants-manager/src/common/collections/tenants/tabular.js
 */

import _ from 'lodash';

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
import { Validity } from 'meteor/pwix:validity';

import { Entities } from '../entities/index.js';
import { Records } from '../records/index.js';

import { Tenants } from './index.js';

const _entity = async function( data ){
    const entity = Meteor.isClient ? await Meteor.callAsync( 'pwix_tenants_manager_entities_getBy', { _id: data.entity }) : await Entities.server.getBy({ _id: data.entity }, Meteor.userId());
    return entity[0];
};

const _record_label = function( it ){
    return it.label;
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

        Tenants.tabular = new Tabular.Table({
            name: 'Tenants',
            collection: Records.collection,
            columns: Tenants.fieldSet.get().toTabular(),
            pub: 'pwix_tenants_manager_tenants_tabular',
            tabular: {
                // display the organization label instead of the identifier in the button title
                async deleteButtonTitle( it ){
                    return pwixI18n.label( I18N, 'buttons.delete_title', _record_label( it ));
                },
                async deleteConfirmationText( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_text', await _record_label( it ));
                },
                async deleteConfirmationTitle( it ){
                    return pwixI18n.label( I18N, 'delete.confirmation_title', await _record_label( it ));
                },
                async deleteItem( it ){
                    return await _entity( it );
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
                console.debug( data );
                data.DYN.analyze.diffs.forEach(( it ) => {
                    const def = columns[it].def;
                    if( def && def.dt_tabular !== false && def.dt_visible !== false ){
                        $( cells[columns[it].index] ).addClass( 'dt-different' );   
                    }
                });
            }
        });
    }
});
