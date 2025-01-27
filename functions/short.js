export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.LINKS;

    const method = request.method;
    let longUrl, shortKey;

    // 处理 GET 请求
    if (method === "GET") {
        const url = new URL(request.url);
        longUrl = url.searchParams.get('longUrl');
        shortKey = url.searchParams.get('shortKey');

        if (!longUrl) {
            return jsonResponse(400, "failed", "No longUrl provided");
        }

        try {
            longUrl = decodeBase64(longUrl);
        } catch {
            return jsonResponse(400, "failed", "Invalid Base64 encoding for longUrl");
        }

        return await handleUrlStorage(kv, longUrl, shortKey);
    } 
    
    // 处理 POST 请求
    else if (method === "POST") {
        const formData = await request.formData();
        longUrl = formData.get('longUrl');
        shortKey = formData.get('shortKey');

        if (!longUrl) {
            return jsonResponse(400, "failed", "No longUrl provided");
        }

        try {
            longUrl = decodeBase64(longUrl);
        } catch {
            return jsonResponse(400, "failed", "Invalid Base64 encoding for longUrl");
        }

        return await handleUrlStorage(kv, longUrl, shortKey);
    }

    // 不支持的请求方法
    return jsonResponse(405, "failed", "Method not allowed");

    /**
     * 处理 URL 存储逻辑
     */
    async function handleUrlStorage(kv, longUrl, shortKey) {
        if (shortKey) {
            const existingValue = await kv.get(shortKey);
            if (existingValue) {
                return jsonResponse(409, "failed", `The custom shortKey \"${shortKey}\" already exists.`);
            }
        } else {
            shortKey = generateRandomKey();
        }

        await kv.put(shortKey, longUrl);
        const shortUrl = `https://${request.headers.get("host")}/${shortKey}`;
        return jsonResponse(200, "success", "URL stored successfully", { shortUrl, longUrl, shortKey });
    }

    /**
     * 返回 JSON 格式响应
     */
    function jsonResponse(statusCode, status, message, data = {}) {
        return new Response(JSON.stringify({ status, message, data }), {
            status: statusCode,
            headers: { "Content-Type": "application/json" }
        });
    }

    /**
     * 生成一个随机六位字符串（字母+数字）
     */
    function generateRandomKey() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 6 }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
    }

    /**
     * Base64 解码函数
     */
    function decodeBase64(encodedString) {
        return atob(encodedString);
    }
}
