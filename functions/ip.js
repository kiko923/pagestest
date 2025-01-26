export async function onRequest(context) {
    const { request, env } = context;

    // 生成一个0到1000之间的随机整数
    const randomNumber = Math.floor(Math.random() * 1000);

    // 返回随机数字
    return new Response(randomNumber.toString());
}
