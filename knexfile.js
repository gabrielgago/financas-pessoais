// knexfile.js
module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: '127.0.0.1',
            user: 'financas',
            password: 'financas',
            database: 'financas',
            port: 3307
        },
        migrations: {
            directory: 'db/migrations',  // Pasta onde as migrations serão salvas
        },
    },
};
