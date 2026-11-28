import { createContext, useContext } from 'react'
import { defaultAccount, type AccountService } from '../../data/account.ts'

/** Lets tests (and later, previews) hand the app a different account service. */
export const AccountContext = createContext<AccountService | null>(null)

/** The account service: the one from context, or the app's real one built from the environment. */
export function useAccountService(): AccountService {
  return useContext(AccountContext) ?? defaultAccount()
}
