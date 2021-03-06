import {
  CommitOutcome, FileChangeType,
  ObjectChangeset,
  ObjectChangeStatusSet,
  ObjectDataRequest, ObjectDataset,
  ObjectQuery,
} from './data';


interface FileFilter {
  extensions: string[];
  name: string;
}


export interface DatasetContext {
  title: string

  useRawObjectsChangedEvent: RawObjectsChangedEventHook

  // Below functions, when take or return object paths, use dataset-relative paths
  // and convert them to and from repo-relative paths under the hood as needed.

  useObjectData: IndexedObjectDataHook
  useObjectPaths: IndexedObjectPathsHook

  useRawObjectPaths: RawObjectPathsHook
  useRawObjectSyncStatus: RawObjectSyncStatusHook
  useRawObjectData: RawObjectDataHook

  // Invokes file selection dialog and returns file data when user confirms.
  // This does not mutate dataset / Git repo contents, changeObjects still
  // must be invoked later in order to commit newly added or replaced file.
  requestFileFromFilesystem: (opts: OpenDialogProps) => Promise<ObjectDataset>

  // Generates a UUID. Not really useful in read-only mode
  makeRandomID: () => Promise<string>

  // Prompts the user to commit changes to the repository.
  // User can review and change the commit message.
  changeObjects?: (changeset: ObjectChangeset, commitMessage: string, ignoreConflicts?: boolean) =>
    Promise<CommitOutcome>

  // Provides a full system-absolute path to given path relative to dataset,
  // which is useful in rare cases.
  makeAbsolutePath: (path: string) => string

  // This may be useful in rare cases with poorly-integrated third-party libraries.
  // Only works for dependencies with corresponding unpackAsar entries
  // in Paneron’s electron-builder config.
  getRuntimeNodeModulePath?: (moduleName: string) => string

  // Invokes file selection dialog,
  // adds selected file(s) to the repository at given location,
  // prompts the user to commit changes to the repository,
  // returns commit outcome.
  // Provisional, probably won’t happen
  // onAddFile?: (opts: OpenDialogProps, commitMessage: string, targetPath: string) => Promise<CommitOutcome & { addedObjects: ObjectDataset }>
}


export interface OpenDialogProps {
  prompt: string
  filters?: FileFilter[]
  allowMultiple?: boolean
}

export interface ValueHook<T> {
  value: T
  errors: Error[]
  isUpdating: boolean
  refresh: () => void
  _reqCounter: number
}

export type RawObjectsChangedEventHook = (
  eventCallback: (event: { objects?: Record<string, Omit<FileChangeType, 'unchanged'> | true> }) => Promise<void>,
  args: any[],
) => void
// TODO: Implement (non-raw) indexed object changed event hook, with dataset-relative paths.

// Following hooks take and return dataset-relative (not repo-relative) object paths.

export type IndexedObjectDataHook = (query: { objectPaths: string[] }) => ValueHook<{ data: Record<string, Record<string, any>> }>
export type IndexedObjectPathsHook = () => ValueHook<{ objectPaths: string[] }>

// These operate on raw data, probably will be deprecated shortly.
export type RawObjectPathsHook = (query: ObjectQuery) => ValueHook<string[]>
export type RawObjectSyncStatusHook = () => ValueHook<ObjectChangeStatusSet>
export type RawObjectDataHook = (objects: ObjectDataRequest) => ValueHook<ObjectDataset>


//export type RemoteUsernameHook = () => ValueHook<{ username?: string }>
//export type AuthorEmailHook = () => ValueHook<{ email: string }>



//export interface WriteableDatasetContext extends DatasetContext {
//  writeable: true
//
//
//  // Obsolete
//
//  //makeAbsolutePath: (path: string) => string
//
//  // Was used primarily by registry kit to check whether user is manager;
//  // now non-managers should not be given access at Git repository level.
//  //useAuthorEmail: AuthorEmailHook
//  //useRemoteUsername: RemoteUsernameHook
//}
