<script lang="ts" setup>
import { onMounted, shallowRef } from 'vue'
import { LIB_VERSION } from '@anta-semenov/electric-sql/version'
import { uniqueTabId } from '@anta-semenov/electric-sql/util'
import { ElectricDatabase, electrify } from '@anta-semenov/electric-sql/wa-sqlite'
import { authToken } from './auth'
import { provideElectric } from './electric'
import { Electric, schema } from './generated/client'

const electric = shallowRef<Electric>()

onMounted(async () => {
  const config = {
    debug: import.meta.env.DEV,
    url: import.meta.env.ELECTRIC_SERVICE,
  }

  const { tabId } = uniqueTabId()
  const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`

  const conn = await ElectricDatabase.init(scopedDbName)
  const client = await electrify(conn, schema, config)
  await client.connect(authToken())


  // Resolves when the shape subscription has been established.
  const shape = await client.db.items.sync()

  // Resolves when the initial data for the shape
  // has been synced into the local database.
  await shape.synced

  electric.value = client
})

provideElectric(electric)
</script>

<template>
  <div v-if="electric">
    <slot />
  </div>
</template>
