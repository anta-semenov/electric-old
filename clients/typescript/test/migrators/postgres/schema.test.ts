import test from 'ava'

import { Database, DatabaseAdapter } from '../../../src/drivers/node-postgres'
import { PgBundleMigrator as BundleMigrator } from '../../../src/migrators/bundle'
import { satelliteDefaults } from '../../../src/satellite/config'

import { randomValue } from '../../../src/util/random'

import migrations from '../../support/migrations/pg-migrations.js'
import { makePgDatabase } from '@anta-semenov/electric-sql-drivers/node-postgres'

type Context = {
  dbName: string
  adapter: DatabaseAdapter
  db: Database
  stopPG: () => Promise<void>
}

let port = 2934
test.beforeEach(async (t) => {
  const dbName = `schema-migrations-${randomValue()}`
  const { db, stop } = await makePgDatabase(dbName, port++)
  const adapter = new DatabaseAdapter(db)

  t.context = {
    adapter,
    dbName,
    stopPG: stop,
  }
})

test.afterEach.always(async (t) => {
  const { stopPG } = t.context as Context
  await stopPG()
})

test('check schema keys are unique', async (t) => {
  const { adapter } = t.context as Context

  const migrator = new BundleMigrator(adapter, migrations)
  await migrator.up()
  const defaults = satelliteDefaults(migrator.queryBuilder.defaultNamespace)
  const metaTable = `${defaults.metaTable}`

  await adapter.run({
    sql: `INSERT INTO ${metaTable} (key, value) values ('key', 'value')`,
  })
  try {
    await adapter.run({
      sql: `INSERT INTO ${metaTable} (key, value) values ('key', 'value')`,
    })
    t.fail()
  } catch (err) {
    const castError = err as { code: string; detail: string }
    t.is(castError.code, '23505')
    t.is(castError.detail, 'Key (key)=(key) already exists.')
  }
})
