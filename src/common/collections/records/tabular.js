/*
 * pwix:tenants-manager/src/common/collections/records/tabular.js
 *
 * Though the Tabular display is primarily driven by Entities, it is defined in the Records collection as most (if not all) data come from there.
 */

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';
import { Tracker } from 'meteor/tracker';

import { Entities } from '../entities/index.js';

import { Records } from './index.js';

const _entity = async function( data ){
    const entity = Meteor.isClient ? await Meteor.callAsync( 'pwix_tenants_manager_entities_getBy', { _id: data.entity }) : await Entities.server.getBy({ _id: data.entity }, Meteor.userId());
    return entity[0];
};

const _record_label = function( it ){
    return it.label;
};

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    if( Records.collectionReady.get() && Records.fieldSet.get()){
        Records.tabular = new Tabular.Table({
            name: 'Records',
            collection: Records.collection,
            columns: Records.fieldSet.get().toTabular(),
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
            destroy: true
        });
    }
});
