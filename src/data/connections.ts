import { readStored, removeStored, writeStored } from '../lib/platform/index.ts'
import { parseConnections, type ConnectionsState } from '../lib/pods/connections.ts'

/**
 * The person's side of pods and picks. STUB storage: on this device only, until the owner-only
 * tables (picks encrypted, with expiry) exist (CLAUDE.md §8.4, §8.9).
 */
const KEY = 'firefly.connections.v1'

export function loadConnections(): ConnectionsState {
  return parseConnections(readStored(KEY))
}

export function saveConnections(state: ConnectionsState): boolean {
  return writeStored(KEY, state)
}

export function deleteConnections(): void {
  removeStored(KEY)
}
