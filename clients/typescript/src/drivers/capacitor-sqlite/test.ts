// Safe entrypoint for tests that avoids importing the Capacitor
// specific dependencies.
import { DbName } from '../../util/types'

import { electrify, ElectrifyOptions } from '../../electric/index'

import { MockMigrator } from '../../migrators/mock'
import { Notifier } from '../../notifiers/index'
import { MockNotifier } from '../../notifiers/mock'
import { MockRegistry } from '../../satellite/mock'

import {
  DatabaseAdapter as CapacitorSQLiteAdapter,
  MockDatabase,
} from '@anta-semenov/electric-sql-drivers/capacitor-sqlite'
import type { Database } from '@anta-semenov/electric-sql-drivers/capacitor-sqlite'
import { MockSocket } from '../../sockets/mock'
import { ElectricClient } from '../../client/model/client'
import { ElectricConfig } from '../../config'
import { DbSchema } from '../../client/model'

const testToken = 'test-token'

type RetVal<DB extends DbSchema<any>, N extends Notifier> = Promise<
  [Database, N, ElectricClient<DB>]
>

export const initTestable = async <
  DB extends DbSchema<any>,
  N extends Notifier = MockNotifier
>(
  dbName: DbName,
  dbDescription: DB,
  config: ElectricConfig = {},
  opts?: ElectrifyOptions
): RetVal<DB, N> => {
  const db = new MockDatabase(dbName)

  const adapter = opts?.adapter || new CapacitorSQLiteAdapter(db)
  const notifier = (opts?.notifier as N) || new MockNotifier(dbName)
  const migrator = opts?.migrator || new MockMigrator()
  const socketFactory = opts?.socketFactory || MockSocket
  const registry = opts?.registry || new MockRegistry()

  const client = await electrify(
    dbName,
    dbDescription,
    adapter,
    socketFactory,
    config,
    {
      notifier: notifier,
      migrator: migrator,
      registry: registry,
    }
  )
  await client.connect(testToken)

  return [db, notifier, client]
}
