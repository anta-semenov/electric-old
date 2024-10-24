import { makeElectricContext } from '@anta-semenov/electric-sql/react'
import type { Electric } from './generated/client'
import type {
  Items as Item,
  Basket_items as BasketItem,
  Orders as Order,
} from './generated/client'

export { schema } from './generated/client'
export type { Item, BasketItem, Order, Electric }
export const { ElectricProvider, useElectric } = makeElectricContext<Electric>()

export type BasketItemWithItem = BasketItem & {
  items: Item
}

export type OrderWithItems = Order & {
  basket_items: BasketItemWithItem[]
}
