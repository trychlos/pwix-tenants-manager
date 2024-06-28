/*
 * pwix:tenants-manager/src/server/js/check_npms.js
 */

import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

if( false ){
    // whitelist packages which are included via a subfolder or badly recognized
}

checkNpmVersions({
    'email-validator': '^2.0.4',
    'lodash': '^4.17.0',
    'valid-url': '^1.0.9'
},
    'pwix:tenants-manager'
);
