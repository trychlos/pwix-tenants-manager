/*
 * pwix:tenants-manager/src/common/collections/tenants/index.js
 *
 * This is a non-serialized collection: it gathers common properties of Entities and Records.
 * For example:
 *  - permissions are common
 *  - publications are common.
 *
 * Because of validities existance, we have two entities and records collections. So two schemas. So entities and records distinct fieldsets.
 * 
 * While most of the accesses are entity-driven, i.e. get the records from the entity. the tabular display is record driven, i.e. displays the closest record for each entity.
 * The fieldset used in that case if those of the record
 */

export { Tenants } from './collection.js';

import './checks.js';
import './fieldset.js';
import './functions.js';
import './tabular.js';
//
import './ready.js';
