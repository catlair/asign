import { app } from '@asign/server/lib'
import type { APIEvent } from '@solidjs/start/server'

const handler = (evt: APIEvent) => app.fetch(evt.request)

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
