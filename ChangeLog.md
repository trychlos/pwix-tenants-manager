# pwix:tenants-managers

## ChangeLog

### 1.3.0-rc

    Release date: 

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
- Last updated on 2024, Sep. 20th
