

export type NotUpdatedList = {
  firstName: string
  personalPhoneNo: string
}

export type R2C = {
  firstName: string
  lastName: string
  hasCalled: number
  personalPhoneNo: string
}

export type WithID<T> = T & { id: string }