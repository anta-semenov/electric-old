import { useEffect, useState } from 'react'

import { LIB_VERSION } from '@anta-semenov/electric-sql/version'
import { makeElectricContext, useLiveQuery } from '@anta-semenov/electric-sql/react'
import { genUUID, uniqueTabId } from '@anta-semenov/electric-sql/util'
import { createDatabase, electrify } from '@anta-semenov/electric-sql/tauri'

import { authToken } from './auth'
import { Electric, Items as Item, schema } from './generated/client'

import './Example.css'

const { ElectricProvider, useElectric } = makeElectricContext<Electric>()

export const Example = () => {
  const [electric, setElectric] = useState<Electric>()

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const config = {
        debug: import.meta.env.DEV,
        url: import.meta.env.ELECTRIC_SERVICE,
      }

      const { tabId } = uniqueTabId()
      const scopedDbName = `basic-${LIB_VERSION}-${tabId}.db`

      const conn = await createDatabase(scopedDbName)
      const client = await electrify(conn, schema, config)

      await client.connect(authToken())

      if (!isMounted) {
        return
      }

      setElectric(client)
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  if (electric === undefined) {
    return null
  }

  return (
    <ElectricProvider db={electric}>
      <ExampleComponent />
    </ElectricProvider>
  )
}

const ExampleComponent = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(db.items.liveMany())

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.items.sync()

      // Resolves when the initial data for the shape
      // has been synced into the local database.
      await shape.synced
    }

    syncItems()
  }, [])

  const addItem = async () => {
    await db.items.create({
      data: {
        value: genUUID(),
      },
    })
  }

  const clearItems = async () => {
    await db.items.deleteMany()
  }

  const items: Item[] = results ?? []

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      {items.map((item: Item, index: number) => (
        <p key={index} className="item">
          <code>{item.value}</code>
        </p>
      ))}
    </div>
  )
}
