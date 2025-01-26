export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.LINKS;

    // 获取请求方法
    const method = request.method;

    let key;
    let urlToStore;

    if (method === "GET") {
        // 从查询字符串中获取 URL
        const url = new URL(request.url);
        urlToStore = url.searchParams.get('url');
        
        if (!urlToStore) {
            return new Response("No URL provided", { status: 400 });
        }

        // 生成一个随机的六位字符串作为键
        key = generateRandomKey();
        
        // 将 URL 存入 KV 空间
        await kv.put(key, urlToStore);
        
        // 返回生成的键和存储的 URL
        return new Response(`URL "${urlToStore}" stored with key: ${key}`);
    } else if (method === "POST") {
        // 处理 POST 请求中的 JSON 数据
        const data = await request.json();
        urlToStore = data.url;
        
        if (!urlToStore) {
            return new Response("No URL provided", { status: 400 });
        }

        // 生成一个随机的六位字符串作为键
        key = generateRandomKey();
        
        // 将 URL 存入 KV 空间
        await kv.put(key, urlToStore);
        
        // 返回生成的键和存储的 URL
        return new Response(`URL "${urlToStore}" stored with key: ${key}`);
    }

    // 生成一个随机六位字符串（字母+数字）
    function generateRandomKey() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
}
