addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname === '/api') {
    return new Response('This is an API endpoint!', {
      headers: { 'content-type': 'application/json' },
    })
  }

  return new Response('Hello, World!', {
    headers: { 'content-type': 'text/html' },
  })
}
