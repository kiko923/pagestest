export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.LINKS;  // KV 命名空间
    const url = new URL(request.url);

    // 从路径中获取要查找的 key
    const pathParts = url.pathname.split('/').filter(Boolean);

    // 如果路径为空，返回 404
    if (pathParts.length === 0) {
        return new Response("Not Found", { status: 404 });
    }

    // 使用路径中的第一个部分作为 key
    const shortKey = pathParts[0];

    // 从 KV 中查找该 key
    const longUrl = await kv.get(shortKey);

    if (longUrl) {
        // 如果找到对应的 longUrl，返回 301 重定向
        return Response.redirect(longUrl, 301);
    } else {
        // 如果找不到该 key，返回 404
        return new Response("Not Found", { status: 404 });
    }
}
