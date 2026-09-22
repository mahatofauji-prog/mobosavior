export enum OperationType {
  GET = 'read',
  READ = 'read',
  WRITE = 'write',
  UPDATE = 'update',
  DELETE = 'delete'
}
export function handleFirestoreError(err: any, type: OperationType, context: string) {
  console.error(`Error during ${type} operation on ${context}:`, err);
}
