/*
 * pwix:tenants-manager/src/common/collections/records/index.js
 */

// have to make sure that common/index is executed before any try to define this dynamically named collection
import '../../js/index.js';

export { Records } from './collection.js';

import './checks.js';
import './fieldset.js';
import './schema.js';
