/*
 * pwix:tenants-manager/src/common/collections/tenants/index.js
 */

// have to make sure that common/index is executed before any try to define this dynamically named collection
import '../../js/index.js';

export { Tenants } from './collection.js';
import './schema.js';
import './checks.js';
