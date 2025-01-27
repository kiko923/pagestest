export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.LINKS;

    const method = request.method;
    let longUrl, shortKey;

    if (method === "GET") {
        const url = new URL(request.url);
        longUrl = url.searchParams.get('longUrl');
        shortKey = url.searchParams.get('shortKey');

        if (!longUrl) {
            return respondWithError("No longUrl provided");
        }

        return await handleUrlStorage(kv, longUrl, shortKey);
    } else if (method === "POST") {
        const formData = await request.formData();
        longUrl = formData.get('longUrl');
        shortKey = formData.get('shortKey');

        if (!longUrl) {
            return respondWithError("No longUrl provided");
        }

        return await handleUrlStorage(kv, longUrl, shortKey);
    }

    // 处理 URL 存储逻辑
    async function handleUrlStorage(kv, longUrl, shortKey) {
        if (shortKey) {
            const existingValue = await kv.get(shortKey);
            if (existingValue) {
                return respondWithError(`The custom shortKey \"${shortKey}\" already exists in KV.`);
            }
        } else {
            shortKey = generateRandomKey();
        }

        await kv.put(shortKey, longUrl);
        return new Response(`URL \"${longUrl}\" stored with shortKey: ${shortKey}`);
    }

    // 返回错误响应
    function respondWithError(message) {
        return new Response(message, { status: 400 });
    }

    // 生成一个随机六位字符串（字母+数字）
    function generateRandomKey() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 6 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
    }
}
