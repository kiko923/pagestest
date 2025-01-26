// 生成一个六位随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Cloudflare Pages API 路由处理
export default async function handler(req, res) {
    // 调用生成随机字符串函数
    const randomString = generateRandomString(6);
    
    // 返回随机字符串作为 JSON 响应
    res.status(200).json({ short_code: randomString });
}
