# pwix:tenants-managers

## ChangeLog

### 1.5.0-rc

    Release date: 

    - Make sure the emitted entity has been transformed
    - Improve the message when user is not allowed
    - Let the tenant manager have a partial list of its own tenant(s)
    - Review the permissions, only keeping user-level ones, thus bumping minor candidate version number
    - Remove aldeed:simple-schema dependency as this same one is already brought up by aldeed:collection2
    - Define 'pwix.tenants_manager.feat.access' permission for access a single tenant
    - Adapt to new pwix-date-input v1.3.0
    - Oganizations are now named 'tenants'

### 1.4.0

    Release date: 2024-11-19

    - Server-side global list no more waits for a client subscription to be initialized
    - Introduce entityTabsBefore and record TabsBefore components parameters, thus bumping minor candidate version number
    - Let each TenantRecordPropertiesPanel row be individually addressed
    - Manage logoUrl
    - Add missing Timestampable declaration
    - Warns once when not finding by entity
    - Fix 'closests' publication (exhibits starting with Meteor 3.0.4)
    - Minor spelling fixes
    - Fix the added tabs re-use
    - Use ValidityCountBadge component instead of local dt_count_badge
    - Make the panels compatible with several validities
    - Define the input fields as type=email or type=url
    - Rename internal Blaze components to improve namespace usage
    - Export the TenantRecordPropertiesPanel component, making it suitable for use inside of an Assistant
    - Fix Tenants.s.deleteTenant() event emit
    - Display tenant managers on the tabular display
    - Bump pwix:roles version prerequisite to take advantage of new tm_entity_scoped_pane component

### 1.3.0

    Release date: 2024-10- 4

    - Increase TenantNewButton left margin
    - Have warnings for some unexpected conditions
    - Define 'entityTabsAfter' and 'recordTabsAfter' TenantsEditPanel component parameters, thus bumping minor candidate version number
    - TenantsManager is a NodeJS EventEmitter on server side
    - Server-side functions are available in Tenants.s namespace
    - Open the new tenant dialog on first pane
    - Define new 'scopedManagerRole' configuration parameter (todo #4)
    - Fix the tabular's row management when the column is not displayed
    - Define new 'serverTabularExtend' configuration parameter
    - Fix configuration overrides
    - Have TenantsManager.list.get() function
    - Extends and maintains TenantsManager.list on server side
    - Fix default ordering by ascending email address
    - Improve (and fix) the display of validity periods count
    - Define new 'serverAllExtend' configuration parameter
    - Prevent infinite recursion when serializing Tabbed data context

### 1.2.0

    Release date: 2024- 9-20

    - Accept aldeed:simple-schema v2.0.0, thus bumping minor candidate version number
    - Introduce ATTACHSCHEMA verbosity level
    - Fix Tabbed names

### 1.1.0

    Release date: 2024- 9-13

    - Introduce 'pwix_tenants_manager_selecting' publication to let a user select a tenant and a validity period
    - Let both entity and record tabbed views be extended, thus bumping minor candidate version number
    - Let the edition modal size be provided by the caller, defaulting to 'modal-xl'
    - Let the caller extends the buttons displayed on the right side of each row
    - Extend the tabular publication to have entity and records
    - Entities.getBy() and Records.getBy() run without a userId
    - Display its label when editing a tenant
    - Upgrade pwix:tabbed to v 1.3.0
    - Track the Checker status and validity
    - Name the TenantEditPanel Tabbed component

### 1.0.0

    Release date: 2024- 7-18

    - Initial release

---
P. Wieser
- Last updated on 2024, Nov. 19th
