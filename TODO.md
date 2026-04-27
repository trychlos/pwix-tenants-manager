# pwix:tenants-manager - TODO

## Summary

1. [Todo](#todo)
2. [Done](#done)

---
## Todo

|   Id | Date       | Description and comment(s) |
| ---: | :---       | :---                       |
|    2 | 2024- 6-28 | have a scheduled job which deletes tenants_e entities which do not have any tenants_r records |
|      |            | as a label - so a record - is supposed to be mandatory to save a tenant |
|    3 | 2024- 6-28 | same than #2 for tenants_r which do not have any tenants_e |
|    5 | 2024- 9-23 | Have an error on publish |
|      |            | Error: Could not find element with id yW5sXgJv4Mt3o8BAh to change
|      |            |   at SessionCollectionView.changed (packages/ddp-server/livedata_server.js:261:13)
|      |            |   at Session.changed (packages/ddp-server/livedata_server.js:485:12)
|      |            |   at Subscription.changed (packages/ddp-server/livedata_server.js:1429:19)
|      |            |   at packages/pwix:tenants-manager/src/common/collections/tenants/server/publish.js:81:30
|      |            |   at processTicksAndRejections (node:internal/process/task_queues:95:5) ignored
|      |            |   Error: Could not find element with id MgveZWDh5C8Mbsgvr to change
|    8 | 2026- 4-24 | should TenantsManager.getScopes() become reactive ? |
|      |            |  or leave it non reactive, and define a new TenantsManager.knownScopes() reactive data source |
|   14 | 2026- 4-25 | have setupHooks() |
|   15 | 2026- 4-27 | honor editFn configuration parameter |
|   16 | 2026- 4-27 | honor newFn configuration parameter |
|   17 |  |  |

---
## Done

|   Id | Date       | Description and comment(s) |
| ---: | :---       | :---                       |
|    1 | 2024- 6-27 | effectStart and effectEnd are expected to be configured in pwix:validty package |
|      |            | should be able to get this configuration back instead of using hard coded values |
|      |            | (and do not ask to configure the same thing here a second time) |
|      | 2024- 7-17 | done |
|    4 | 2024- 7-16 | do not hardcode ORD_SCOPED_MANAGER in tenantsAll publication |
|      | 2024- 9-30 | done |
|    6 | 2024-11-16 | have tenant manager |
|      | 2024-11-16 | done |
|    7 | 2025- 7-22 | edit dialog: have a single close button while the tenant has not been modified |
|      | 2026- 4-23 | introduced with 'modifiedOnUpdate' configuration parameter |
|      | 2026- 4-27 | which becomes 'withCloseButtonWhileNotModified' setupEditor() option |
|      | 2026- 4-27 | done |
|    9 | 2026- 4-24 | Entities/Records collectionReady reactive var should become a ready() reactive data source |
|      | 2026- 4-25 | done |
|   10 | 2026- 4-25 | Tenants ready reactive var should become a ready() reactive data source |
|      | 2026- 4-25 | done |
|   11 | 2026- 4-25 | Tenants should not have its own fieldset but should use those of the records |
|      | 2026- 4-26 | done |
|   12 | 2026- 4-25 | Use TenantsManager.C.pub.tabular.collection instead of Records.collectionName |
|      | 2026- 4-25 | done |
|   13 | 2026- 4-25 | have setupEditor() |
|      | 2026- 4-27 | this is the right place to move the 'modifiedOnUpdate' parameter to |
|      | 2026- 4-27 | which becomes withCloseButtonWhileNotModified |
|      | 2026- 4-27 | done |

---
P. Wieser
- Last updated on 2026, Feb. 10th
