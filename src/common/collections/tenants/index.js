/*
 * pwix:tenants-manager/src/common/collections/tenants/index.js
 *
 * This is a non-serialized collection: it gathers common properties of Entities and Records.
 * For example:
 *  - permissions are common
 *  - publications are common.
 *
 * But we do not have any fieldset here, nor any serialization.
 */

import { Tenants } from './collection.js';
export { Tenants };

import './checks.js';
import './tabular.js';

console.debug( 'defined Tenants' );
