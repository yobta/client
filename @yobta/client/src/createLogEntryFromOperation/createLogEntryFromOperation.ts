import { YobtaLogEntry, YobtaLoggedOperation } from '../createLog/createLog.js'

interface YobtaCreateLogEntryFromOperation {
  (operation: YobtaLoggedOperation): YobtaLogEntry
}

export const createLogEntryFromOperation: YobtaCreateLogEntryFromOperation = ({
  id,
  channel,
  committed,
  merged,
  type,
  snapshotId,
  nextSnapshotId,
  operationId,
}) =>
  [
    id,
    channel,
    committed,
    merged,
    type,
    snapshotId,
    nextSnapshotId,
    operationId,
  ] as YobtaLogEntry
