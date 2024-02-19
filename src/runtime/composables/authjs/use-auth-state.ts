import type { Session } from '@auth/core/types'

import { useCommonAuthState } from '../use-common-auth-state'

export type SessionData = Session

export const useAuthState = () => useCommonAuthState<SessionData>()
