/*
 * pwix:tenants-manager/src/common/collections/tenants/tabular.js
 */

import _ from 'lodash';

import { pwixI18n } from 'meteor/pwix:i18n';
import { Tabular } from 'meteor/pwix:tabular';
import { Tracker } from 'meteor/tracker';
import { Validity } from 'meteor/pwix:validity';

import { Entities } from '../entities/index.js';
import { Records } from '../records/index.js';

console.debug( 'tabular.js' );

const _entity = async function( data ){
    const entity = Meteor.isClient ? await Meteor.callAsync( 'pwix_tenants_manager_entities_getBy', { _id: data.entity }) : await Entities.server.getBy({ _id: data.entity }, Meteor.userId());
    return entity[0];
};

const _record_label = function( it ){
    return it.label;
};

let _handle = null;

/*
if( Meteor.isClient ){
    Tracker.autorun(() => {
        if( Records.collectionReady.get() && Records.fieldSet.get()){
            _handle = Meteor.subscribe( TenantsManager.C.pub.closests.publish );
        }
    });
}
    */

Tracker.autorun(() => {
    const conf = TenantsManager.configure();
    let rowgroups = {};
    //if( Meteor.isServer || ( _handle && _handle.ready())){
    if( Entities.collectionReady.get()){
        Records.tabular = new Tabular.Table({
            name: 'Records',
            collection: Entities.collection,
            /*
            changeSelector( selector, userId ){
                const closests = TenantsManager.list.getClosests();
                console.debug( 'closests', closests );
                return { _id: { $in: closests }};
            },
            */
            pub: TenantsManager.C.pub.closests.publish,
            //collection: TenantsManager.collections.get( TenantsManager.C.pub.closests.collection ),
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
            destroy: true,
            order: {
                name: 'entity',
                dir: 'asc'
            },
            // subcription returns all tenants records
            //  we want aggregate all records of each tenant into a single row which consolidate all values into something close of the 'closest'
            //  we accomplish that by NOT displaying any record row, and then adding a just-built 'almost-closest' entity row
            // https://datatables.net/reference/option/createdRow
            /*
            createdRow: function( row, data, dataIndex, cells ){
                if( 0 ){
                    if( data.rowgroup === 1 ){
                        console.debug( 'displaying rowgroup', data );
                        data.rowgroup += 1;
                    } else {
                        console.debug( 'ignoring', data );
                        $( row ).addClass( 'ui-dnone' );
                    }
                }
                if( 1 ){
                    if( rowgroups[data.entity] === 1 ){
                        console.debug( 'displaying rowgroup', data );
                        rowgroups[data.entity] += 1;
                        $( row ).css( 'color', 'red' );
                    } else {
                        console.debug( 'ignoring', data );
                        $( row ).addClass( 'ui-dnone' );
                    }
                }
            },
            rowGroup: {
                dataSrc: 'entity',
                //className: 'tm-entity-group',
                startRender: null,
                //endRender: null
                // https://datatables.net/reference/option/rowGroup.endRender
                endRender( rows, group, level ){
                    const entity = TenantsManager.list.byEntity( group );
                    const _debug = true;
                    if( _debug ){
                        const records = rows.data();
                        for( let i=0 ; i<records.length ; ++i ){
                            console.debug( 'endRender', i, records[i] );
                        }
                    }
                    let closest = _.cloneDeep( Validity.closestByRecords( entity.DYN.records ).record );
                    if( 1 ){
                        if( 0 ){
                            if( closest.rowgroup ){
                                console.debug( 'ended' );
                            } else {
                                closest.rowgroup = 1;
                                console.debug( 'adding item', closest );
                                rows.table().row.add( closest ).draw(); 
                            }
                        }
                        if( 1 ){
                            if( rowgroups[group] ){
                                console.debug( 'ended' );
                            } else {
                                rowgroups[group] = 1;
                                closest._id = 1;
                                closest._rowgroup = 1;
                                closest.contactUrl = "https://contact.exemple.contact/contact";
                                console.debug( 'adding item', closest );
                                //rows.table().row.add( closest ).draw();
                                return closest;
                            }
                        }
                    }
                    // adding each column is difficult as they would imply to manage too those added by pwix:tabular
                    if( 0 ){
                        let $tr = $( '<tr>' );
                        Records.fieldSet.get().toTabular().forEach(( col ) => {
                            if( col.visible !== false ){
                                console.debug( 'col', col );
                                const $td = $( '<td>'+( closest[col.data] || '' )+'</td>' );
                                $tr.append( $td );
                            }
                        });
                        console.debug( '$tr', $tr );
                        return $tr;
                    }
                    return '';
                }
            }
                    */
        });
    }
});
