export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.LINKS;

    // 获取请求方法
    const method = request.method;

    let key;
    if (method === "GET") {
        // 从查询字符串中获取键
        const url = new URL(request.url);
        key = url.searchParams.get('key');
    } else if (method === "POST") {
        // 处理 POST 请求中的 JSON 数据
        const data = await request.json();
        key = data.key;
    }

    if (!key) {
        return new Response("No key provided", { status: 400 });
    }

    // 检查该键是否存在于 KV 空间
    const value = await kv.get(key);

    if (value) {
        // 如果键存在，返回存在的提示
        return new Response(`Key "${key}" exists in KV with value: ${value}`);
    } else {
        // 如果键不存在，返回不存在的提示
        return new Response(`Key "${key}" does not exist in KV`, { status: 404 });
    }
}
