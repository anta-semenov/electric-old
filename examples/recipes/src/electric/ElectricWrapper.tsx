import { ReactElement, useEffect, useState } from 'react'
import { makeElectricContext } from '@anta-semenov/electric-sql/react'
import { authToken } from './auth.ts'
import { LIB_VERSION } from '@anta-semenov/electric-sql/version'
import { uniqueTabId } from '@anta-semenov/electric-sql/util'
import { ElectricDatabase, electrify } from '@anta-semenov/electric-sql/browser'
import { Electric, schema } from '../generated/client/index.ts'

const { ElectricProvider, useElectric } = makeElectricContext<Electric>()

// eslint-disable-next-line react-refresh/only-export-components
export { useElectric }

export function ElectricWrapper(props: { children: ReactElement[] | ReactElement }) {
  const [electric, setElectric] = useState<Electric>()

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const config = {
        debug: import.meta.env.DEV,
        url: import.meta.env.ELECTRIC_SERVICE,
      }

      const { tabId } = uniqueTabId()
      const scopedDbName = `recipes-${LIB_VERSION}-${tabId}.db`

      const conn = await ElectricDatabase.init(scopedDbName)
      const electric = await electrify(conn, schema, config)
      await electric.connect(authToken())

      if (!isMounted) {
        return
      }

      setElectric(electric)
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  if (electric === undefined) {
    return null
  }

  return <ElectricProvider db={electric}>{props.children}</ElectricProvider>
}
