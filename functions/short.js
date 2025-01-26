export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.LINKS;

    // 获取请求方法
    const method = request.method;

    let shortKey;
    let longUrl;

    if (method === "GET") {
        // 从查询字符串中获取 longUrl 和 shortKey
        const url = new URL(request.url);
        longUrl = url.searchParams.get('longUrl');
        shortKey = url.searchParams.get('shortKey');

        if (!longUrl) {
            return new Response("No longUrl provided", { status: 400 });
        }

        // 判断是否传入了自定义 shortKey
        if (shortKey) {
            // 检查自定义 shortKey 是否已存在
            const existingValue = await kv.get(shortKey);
            if (existingValue) {
                return new Response(`The custom shortKey "${shortKey}" already exists in KV.`, { status: 400 });
            }
            // 如果不存在，则使用 shortKey 存储 URL
            await kv.put(shortKey, longUrl);
            return new Response(`URL "${longUrl}" stored with custom shortKey: ${shortKey}`);
        } else {
            // 如果没有传入 shortKey，生成一个随机六位字符串作为键
            shortKey = generateRandomKey();
            await kv.put(shortKey, longUrl);
            return new Response(`URL "${longUrl}" stored with generated shortKey: ${shortKey}`);
        }
    } else if (method === "POST") {
        // 处理 POST 请求中的表单数据
        const formData = await request.formData();
        longUrl = formData.get('longUrl');
        shortKey = formData.get('shortKey');

        if (!longUrl) {
            return new Response("No longUrl provided", { status: 400 });
        }

        // 判断是否传入了自定义 shortKey
        if (shortKey) {
            // 检查自定义 shortKey 是否已存在
            const existingValue = await kv.get(shortKey);
            if (existingValue) {
                return new Response(`The custom shortKey "${shortKey}" already exists in KV.`, { status: 400 });
            }
            // 如果不存在，则使用 shortKey 存储 URL
            await kv.put(shortKey, longUrl);
            return new Response(`URL "${longUrl}" stored with custom shortKey: ${shortKey}`);
        } else {
            // 如果没有传入 shortKey，生成一个随机六位字符串作为键
            shortKey = generateRandomKey();
            await kv.put(shortKey, longUrl);
            return new Response(`URL "${longUrl}" stored with generated shortKey: ${shortKey}`);
        }
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
