import { LIB_VERSION } from '@anta-semenov/electric-sql/version'
import { ElectricConfig } from 'electric-sql'
import { makeElectricContext } from '@anta-semenov/electric-sql/react'
import { uniqueTabId, genUUID } from '@anta-semenov/electric-sql/util'
import { insecureAuthToken } from '@anta-semenov/electric-sql/auth'
import { Capacitor } from '@capacitor/core'
import { Electric, schema, Appointments } from './generated/client'

export const { ElectricProvider, useElectric } = makeElectricContext<Electric>()
export type Appointment = Appointments

const discriminator = 'iconicdemo'

// import.meta.env is a special object that Vite provides for accessing
// environment variables at build time and runtime.
// They are replaced at build time with the actual values.
// https://vitejs.dev/guide/env-and-mode.html
const DEV_MODE = import.meta.env.DEV
const ELECTRIC_URL = import.meta.env.ELECTRIC_URL
const DEBUG_ENV = import.meta.env.DEBUG

// We can override the debug mode with a query param: ?debug=true or ?debug=false
const searchParams = new URLSearchParams(window.location.search)
const debugParam = searchParams.get('debug')

// DEBUG defaults to true in dev mode, false in prod mode
export const DEBUG = debugParam ? debugParam === 'true' : DEV_MODE || DEBUG_ENV

// We export dbName so that we can delete the database if the schema changes
export let dbName: string

export const initElectric = async () => {
  const { tabId } = uniqueTabId()

  let electricUrl = ELECTRIC_URL ?? 'ws://localhost:5133'

  // NOTE: when running on an Android emulator, need to use the virtual
  // address to your host loopback interface
  // see: https://developer.android.com/studio/run/emulator-networking
  if (Capacitor.getPlatform() === 'android') {
    electricUrl = electricUrl.replace('://localhost', '://10.0.2.2')
  }

  dbName = `${discriminator}-${LIB_VERSION}-${tabId}.db`

  const config = {
    url: electricUrl,
    debug: DEBUG,
  }

  const client = Capacitor.isNativePlatform()
    ? await initCapacitorSQLite(dbName, config)
    : await initWaSQLite(dbName, config)

  await client.connect(insecureAuthToken({ sub: genUUID() }))
  return client
}

async function initWaSQLite(dbName: string, config: ElectricConfig) {
  const { ElectricDatabase, electrify } = await import('@anta-semenov/electric-sql/wa-sqlite')
  const conn = await ElectricDatabase.init(dbName)
  return await electrify(conn, schema, config)
}

async function initCapacitorSQLite(dbName: string, config: ElectricConfig) {
  const { electrify } = await import('@anta-semenov/electric-sql/capacitor')
  const { CapacitorSQLite, SQLiteConnection } = await import(
    '@capacitor-community/sqlite'
  )
  const sqliteConnection = new SQLiteConnection(CapacitorSQLite)
  const conn = await sqliteConnection.createConnection(
    dbName,
    false,
    '',
    1,
    false,
  )
  await conn.open()
  return await electrify(conn, schema, config)
}
