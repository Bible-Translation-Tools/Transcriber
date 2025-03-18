class IndexedDBImageRepository {
    private dbPromise: Promise<IDBDatabase>;
    private dbName = 'imageDB';
    private objectStoreName = 'images';
  
    constructor() {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
  
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.objectStoreName)) {
            db.createObjectStore(this.objectStoreName);
          }
        };
  
        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };
  
        request.onerror = (event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
      });
    }
  
    async storeImage(imageId: string, imageData: ArrayBuffer): Promise<string> {
      const db = await this.dbPromise;
      const transaction = db.transaction(this.objectStoreName, 'readwrite');
      const store = transaction.objectStore(this.objectStoreName);
  
      return new Promise((resolve, reject) => {
          const request = store.put(imageData, imageId);
  
          request.onsuccess = () => {
            resolve(imageId);
          };
  
          request.onerror = () => {
            reject(request.error);
          };
      });
    }
  
    async retrieveImage(imageId: string): Promise<ArrayBuffer | null> {
      const db = await this.dbPromise;
      const transaction = db.transaction(this.objectStoreName, 'readonly');
      const store = transaction.objectStore(this.objectStoreName);
  
      return new Promise((resolve, reject) => {
        const request = store.get(imageId);
  
        request.onsuccess = () => {
          resolve(request.result as ArrayBuffer | null);
        };
  
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  }

  export default IndexedDBImageRepository;