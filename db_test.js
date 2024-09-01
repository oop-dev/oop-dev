import {Pool} from "pg";

// 创建一个连接池
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'root',
    database: 'odb',
    port: 5432,
    max: 10, // 连接池中最大的连接数
    idleTimeoutMillis: 30000, // 30秒内未被使用的连接将被关闭
    connectionTimeoutMillis: 2000, // 2秒内无法建立连接则报错
});
const client = await pool.connect(); // 获取连接池中的一个客户端
console.log(await client.query(`select * from users;`))
