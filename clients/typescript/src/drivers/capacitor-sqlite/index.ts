// N.b.: importing this module is an entrypoint that imports the Capacitor
// environment dependencies. You can
// use the alternative entrypoint in `./test` to avoid importing this.
import { DbName } from '../../util/types'

import {
  ElectrifyOptions,
  electrify as baseElectrify,
} from '../../electric/index'

import { DatabaseAdapter } from '@anta-semenov/electric-sql-drivers/capacitor-sqlite'
import { ElectricConfig } from '../../config'
import type { Database } from '@anta-semenov/electric-sql-drivers/capacitor-sqlite'
import { WebSocketWeb } from '../../sockets/web'
import { ElectricClient } from '../../client/model/client'
import { DbSchema } from '../../client/model/schema'

export { DatabaseAdapter }
export type { Database }

export const electrify = async <T extends Database, DB extends DbSchema<any>>(
  db: T,
  dbDescription: DB,
  config: ElectricConfig = {},
  opts?: ElectrifyOptions
): Promise<ElectricClient<DB>> => {
  const dbName: DbName = db.dbname!
  const adapter = opts?.adapter || new DatabaseAdapter(db)
  const socketFactory = opts?.socketFactory || WebSocketWeb

  const namespace = await baseElectrify(
    dbName,
    dbDescription,
    adapter,
    socketFactory,
    config,
    opts
  )

  return namespace
}
