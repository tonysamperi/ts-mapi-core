import {DynamoDB, DeleteItemInput, GetItemInput, PutItemInput, DynamoDBClientConfig} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {SmpLoggerMethods} from "@tonysamperi/logger";

enum ErrorsMap {
    CouldNotDelete = "ERR_COULD_NOT_DELETE",
    CouldNotRead = "ERR_COULD_NOT_READ",
    CouldNotWrite = "ERR_COULD_NOT_WRITE",
    ConditionalCheckFailedException = "ERR_DUPE_TOKEN",
}

export class SmpDynamoService<BaseKey extends object = object, PartitionKey extends string = string> {
    get marshall() {
        return marshall;
    }

    get unmarshall() {
        return unmarshall;
    }

    protected _db: DynamoDB = new DynamoDB([
        this._buildConfig()
    ]);
    protected _logger: SmpLoggerMethods = new SmpLoggerMethods();

    protected constructor(
        protected _config: DynamoDBClientConfig,
        protected _tableName: string
    ) {
    }

    /**
     * Just for override purposes
     * @protected
     */
    protected _buildConfig(): DynamoDBClientConfig {
        return this._config;
    }

    protected _delete<T extends Record<PartitionKey, string> = Record<PartitionKey, string>>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Key: T,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        TableName: string = this._tableName,
        opts?: Omit<DeleteItemInput, "Key" | "TableName">
    ) {
        const params: GetItemInput = {
            TableName,
            Key: this.marshall(Key),
            ...opts
        };

        return this._db
            .deleteItem(params)
            .catch((err) => {
                this._logger.error("DynamoActionTokensService: couldn't write token to DB", err);
                return Promise.reject((ErrorsMap as any)[err.code] || ErrorsMap.CouldNotDelete);
            });
    }

    /**
     * Read data from Dynamo passing a normal object
     * @param Key the index you're searching, as standard object es. {myPartitionKey: "someValue"}
     * @param TableName optionally override the table you're writing to
     * @param opts attribute names mapping, values, etc...
     * @protected
     */
    protected _read<T extends Record<PartitionKey, string> = Record<PartitionKey, string>>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Key: T,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        TableName: string = this._tableName,
        opts?: Omit<GetItemInput, "TableName" | "Item">
    ) {
        const params: GetItemInput = {
            TableName,
            Key: this.marshall(Key),
            ...opts
        };

        return this._db
            .getItem(params)
            .catch((err) => {
                this._logger.error("DynamoActionTokensService: couldn't write token to DB", err);
                return Promise.reject((ErrorsMap as any)[err.code] || ErrorsMap.CouldNotRead);
            });
    }

    /**
     * Write data to Dynamo passing a normal object
     * @param Item
     * @param TableName
     * @param opts
     * @protected
     */
    protected _write<T extends BaseKey = BaseKey>(
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Item: T,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        TableName: string = this._tableName,
        opts: Omit<PutItemInput, "Item" | "TableName">
    ) {
        // Set up the parameters for the DynamoDB PutItem operation
        const params = {
            TableName,
            Item: this.marshall(Item),
            ...opts
        };

        return this._db
            .putItem(params)
            .catch((err) => {
                this._logger.error("DynamoActionTokensService: couldn't write token to DB", err);
                return Promise.reject((ErrorsMap as any)[err.code] || ErrorsMap.CouldNotWrite);
            });
    }
}
