export async function onRequest(context) {
  // 生成随机后缀的函数
  function generateRandomSuffix(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 处理创建短链接请求
  async function handleRequest(request) {
    const url = new URL(request.url);
    let targetUrl;
    let customSuffix;

    // 检查请求方法，GET 或 POST
    if (request.method === 'GET') {
      targetUrl = url.searchParams.get('longUrl');  // 获取长链接
      customSuffix = url.searchParams.get('shortKey');  // 获取自定义后缀
    } else if (request.method === 'POST') {
      const formData = await request.formData();  // 解析表单数据
      targetUrl = formData.get('longUrl');  // 获取长链接
      customSuffix = formData.get('shortKey');  // 获取自定义后缀
    }

    // 如果没有传入目标URL，返回错误
    if (!targetUrl) {
      return new Response(JSON.stringify({
        code: 201,
        error: 'Failed to get long URL. Please check the short URL if exists or expired.'
      }), {
        status: 400,
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
            'Content-Type': 'application/json' }
      });
    }

    // 将 Base64 编码的 longUrl 解码
    try {
      targetUrl = atob(targetUrl);  // 使用 atob 进行 Base64 解码
    } catch (error) {
      return new Response(JSON.stringify({
        code: 201,
        error: 'Failed to decode long URL. Please check if it is properly encoded.'
      }), {
        status: 400,
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
          'Content-Type': 'application/json' }
      });
    }

    // 如果指定了自定义后缀，则使用它；否则生成一个随机后缀
    const suffix = customSuffix || generateRandomSuffix(6);  // 默认6位随机后缀

    // 获取当前 Worker 的域名
    const workerDomain = request.headers.get('host');  // 获取当前访问的域名

    // 检查 KV 存储中是否已存在该自定义后缀
    const existingUrl = await LINKS.get(suffix);
    if (existingUrl) {
      return new Response(JSON.stringify({
        code: 201,
        error: 'Short key already exists. Please use another one or leave it empty to generate automatically.'
      }), {
        status: 400,
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
          'Content-Type': 'application/json' }
      });
    }

    // 构建短链接
    const shortLink = `https://${workerDomain}/${suffix}`;

    // 将短链接映射到目标URL，存储到 KV 存储
    try {
      await LINKS.put(suffix, targetUrl);
    } catch (error) {
      return new Response(JSON.stringify({
        code: 500,
        error: 'Failed to store the short URL.'
      }), {
        status: 500,
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
          'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      code: 200,
      shortUrl: shortLink
    }), {
      status: 200,
      headers: {
            "content-type": "application/json;charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        'Content-Type': 'application/json' }
    });
  }

  // 执行生成短链接函数

    event.respondWith(handleRequest(event.request));
}
