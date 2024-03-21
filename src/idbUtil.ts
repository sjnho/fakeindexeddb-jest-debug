
export interface IndexConfig {
    indexName: string;
    keyPath: string | string[];
    unique?: boolean;
}

interface StoreConfig {
    storeName: string;
    options?: IDBObjectStoreParameters;
    indexConfigs?: IndexConfig[];
}
export interface IDBConfig {
    version: number;
    dbName: string;
    storeNames: string[];
    storeConfigs?: Partial<StoreConfig>[]; //order same with storeNames
}
async function openIDB(config: IDBConfig): Promise<IDBDatabase | undefined> {
    if (!window.indexedDB || !window.IDBKeyRange) {
        console.log("Your browser doesn't support a stable version of IndexedDB. IndexedDB will not be available.");
        return void 0;
    }
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(config.dbName, config.version);
        request.onerror = () => {
            reject(request.error);
        };
        request.onupgradeneeded = (): void => {
            const nextDb = request.result;
            const newStoreConfigs: StoreConfig[] = config.storeNames.reduce((acc, storeName, curIndex) => {
                if (!nextDb.objectStoreNames.contains(storeName)) {
                    acc.push({ storeName, ...config.storeConfigs?.[curIndex] });
                }
                return acc;
            }, [] as StoreConfig[]);

            const oldStores: string[] = Array.from(nextDb.objectStoreNames).filter(
                (value) => !config.storeNames.includes(value)
            );
            newStoreConfigs.forEach((storeConfig: StoreConfig) => {
                const objectStore = nextDb.createObjectStore(storeConfig.storeName, storeConfig.options);
                const storeIndexConfigs = storeConfig.indexConfigs;
                if (Array.isArray(storeIndexConfigs)) {
                    storeIndexConfigs.forEach((indexConfig) => {
                        objectStore.createIndex(indexConfig.indexName, indexConfig.keyPath, {
                            unique: indexConfig.unique ?? false,
                        });
                    });
                }
            });
            oldStores.forEach((storeName: string) => {
                nextDb.deleteObjectStore(storeName);
            });
        };
        request.onsuccess = () => {
            const db = request.result;
            resolve(db);
        };
    });
}

function comparer(a: any, b: any) {
    let result = 0;
    if (a < b) {
        result = -1;
    } else if (a > b) {
        result = 1;
    } else {
        result = 0;
    }

    return result;
}

export class IDBUtil<T> {
    private _db: IDBDatabase | undefined;
    constructor(private _config: IDBConfig) {}

    async ready(config: IDBConfig) {
        if (!this._db) {
            this._db = await openIDB(config);
            if (!this._db) {
                throw new Error('IDB not supported');
            }
        }
        return this._db;
    }

    async add(storeName: string, key: string | undefined, value: T): Promise<T> {
        const db = await this.ready(this._config);
        return new Promise((res, rej) => {
            const request = db.transaction([storeName], 'readwrite').objectStore(storeName).add(value, key);
            request.onsuccess = () => {
                res(value);
            };
            request.onerror = () => {
                rej(request.error);
            };
        });
    }
    async removeByIndexUpper(storeName: string, indexName: string, upperBound: any): Promise<void> {
        const db = await this.ready(this._config);
        return new Promise((res, rej) => {
            const store = db.transaction([storeName], 'readwrite').objectStore(storeName);
            const index = store.index(indexName);
            const range = IDBKeyRange.upperBound(upperBound);
            const request = index.openCursor(range);
            request.onsuccess = function () {
                const cursor = request.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    res();
                }
            };
            request.onerror = () => {
                rej(request.error);
            };
        });
    }
    async getAllList(storeName: string): Promise<T[]> {
        const db = await this.ready(this._config);
        return new Promise((res, rej) => {
            const request = db.transaction([storeName]).objectStore(storeName).getAll();
            request.onsuccess = () => {
                res(request.result);
            };
            request.onerror = () => {
                rej(request.error);
            };
        });
    }
}
