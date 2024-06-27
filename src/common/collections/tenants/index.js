/*
 * pwix:tenants-manager/src/common/collections/tenants/index.js
 *
 * This is a pseudo-collection: just an object which gathers common properties of Entities and Records.
 * For example:
 *  - permissions are common
 *  - publications are common.
 *
 * But we do not have any fieldset here, nor any collection serialization.
 */

export { Tenants } from './collection.js';

import './checks.js';
