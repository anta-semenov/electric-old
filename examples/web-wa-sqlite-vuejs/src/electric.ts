import { makeElectricDependencyInjector } from '@anta-semenov/electric-sql/vuejs'
import { Electric } from './generated/client'

const { provideElectric, injectElectric } =
  makeElectricDependencyInjector<Electric>()

export { provideElectric, injectElectric }
