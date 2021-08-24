import { Client, Profile, WebhookEvent } from "@line/bot-sdk";

export type LineCredential = {
  lineIDToken: string
  lineUserID: string
  noAuth?: boolean
}

export type UserObject = {
  userId: string
  profile: Profile

}

export type LineHandler<T = WebhookEvent> = (event: T, userObject: UserObject, client: Client) => any | Promise<any>

