/*
 * pwix:tenants-manager/src/common/collections/tenants/checks.js
 */

import { Tenants } from './index.js';

Tenants.checks = {};

Tenants.checks.canDelete = async function( userId ){
    return await Roles.userIsInRoles( userId, TenantsManager.configure().roles.delete );
};

Tenants.checks.canEdit = async function( userId ){
    return await Roles.userIsInRoles( userId, TenantsManager.configure().roles.edit );
};

Tenants.checks.canList = async function( userId ){
    return await Roles.userIsInRoles( userId, TenantsManager.configure().roles.list );
};

// fields check
//  - value: mandatory, the value to be tested
//  - data: optional, the data passed to Checker instanciation
//    if set the target item as a ReactiveVar, i.e. the item to be updated with this value
//  - opts: an optional behaviour options, with following keys:
//    > update: whether the item be updated with the value, defaults to true
//    > id: the identifier of the edited row when editing an array
// returns a TypedMessage, or an array of TypedMessage, or null

// item is a ReactiveVar which contains the edited document
const _assert_data_itemrv = function( caller, data ){
    assert.ok( data, caller+' data required' );
    assert.ok( data.item, caller+' data.item required' );
    assert.ok( data.item instanceof ReactiveVar, caller+' data.item expected to be a ReactiveVar' );
}
