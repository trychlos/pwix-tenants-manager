/*
 * pwix:tenants-manager/src/client/components/dt_count_badge/dt_count_badge.js
 *
 * This template is used to display the count of validity records when there are more than one.
 * 
 * Data context:
 * - item: the item as provided to the tabular display (i.e. a modified closest record)
 *   with DYN { analyze, entity, records }
 * - table: the Tabular.Table instance
 */

import { pwixI18n } from 'meteor/pwix:i18n';

import './dt_count_badge.html';

Template.dt_count_badge.helpers({
    // the records count
    count(){
        return this.item.DYN.records.length;
    },
    // make the badge transparent if count is just one
    classes(){
        return this.item.DYN.records.length === 1 ? 'ui-transparent' : '';
    },
    // a title to be provided if visible
    title(){
        return this.item.DYN.records.length === 1 ? '' : pwixI18n.label( I18N, 'buttons.count_badge_title', this.item.label, this.item.DYN.count );
    }
});
