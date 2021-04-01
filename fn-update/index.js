// require('dotenv').config()
const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    try {
        const endpoint = process.env['ACCOUNT_URI'];
        const key = process.env['ACCOUNT_KEY'];

        const client = new CosmosClient({ endpoint: endpoint, key: key });
        const { database } = await client.databases.createIfNotExists({ id: 'ToDoDB' });
        const { container } = await database.containers.createIfNotExists({ id: 'Actions' });

        const title = (req.query.title || (req.body && req.body.title));
        const complete = (req.query.complete || (req.body && req.body.complete));
        const id = (req.query.id || (req.body && req.body.id));

        const querySpec = {
        query: 'SELECT * FROM Actions f WHERE  f.id = @id',
        parameters: [
                {
                    name: '@id',
                    value: id
                }
            ]
        };

        const { resources: results } = await container.items.query(querySpec).fetchAll();
        const item = results[0];
        item.title = title;
        item.complete = complete;

        await container.items.upsert(item);

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: 'Saved'
        };
    } catch(error) {
        context.log('error ', error);
        context.res = {
            status: 500, /* Defaults to 200 */
            body: error
        };
    }
}