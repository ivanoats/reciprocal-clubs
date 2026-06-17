const DEFAULT_KEY = 'ncds_20c.pmtiles'

const parseAllowedOrigins = (raw) =>
  (raw || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

const isLocalDevOrigin = (requestOrigin) => {
  if (!requestOrigin) {
    return false
  }

  try {
    const { hostname, protocol } = new URL(requestOrigin)
    return protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')
  } catch {
    return false
  }
}

const matchesAllowedOrigin = (requestOrigin, allowedOrigin) => {
  if (allowedOrigin === '*') {
    return true
  }

  if (allowedOrigin === requestOrigin) {
    return true
  }

  if (allowedOrigin.startsWith('*.')) {
    const suffix = allowedOrigin.slice(1)

    try {
      const requestHost = new URL(requestOrigin).hostname
      return requestHost.endsWith(suffix)
    } catch {
      return false
    }
  }

  return false
}

const resolveCorsOrigin = (requestOrigin, allowedOrigins) => {
  if (!requestOrigin) {
    return '*'
  }

  // Always allow local development origins, regardless of explicit port.
  if (isLocalDevOrigin(requestOrigin)) {
    return requestOrigin
  }

  if (allowedOrigins.some((allowedOrigin) => matchesAllowedOrigin(requestOrigin, allowedOrigin))) {
    return requestOrigin
  }

  return allowedOrigins[0] || '*'
}

const applyCors = (headers, requestOrigin, allowedOrigins) => {
  headers.set('access-control-allow-origin', resolveCorsOrigin(requestOrigin, allowedOrigins))
  headers.set('access-control-allow-methods', 'GET,HEAD,OPTIONS')
  headers.set('access-control-allow-headers', 'Range,Content-Type')
  headers.set('access-control-expose-headers', 'Accept-Ranges,Content-Length,Content-Range,Content-Type,ETag')
  headers.set('vary', 'Origin')
}

const getObjectKey = (pathname) => {
  const trimmed = pathname.replace(/^\/+/, '')
  return trimmed || DEFAULT_KEY
}

const worker = {
  async fetch(request, env) {
    const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS)
    const origin = request.headers.get('origin') || ''

    if (request.method === 'OPTIONS') {
      const headers = new Headers()
      applyCors(headers, origin, allowedOrigins)
      return new Response(null, { status: 204, headers })
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { allow: 'GET,HEAD,OPTIONS' },
      })
    }

    const url = new URL(request.url)
    const key = getObjectKey(url.pathname)

    const object = await env.CHARTS_BUCKET.get(key, {
      range: request.headers,
      onlyIf: request.headers,
    })

    if (!object) {
      const headers = new Headers({ 'content-type': 'text/plain; charset=utf-8' })
      applyCors(headers, origin, allowedOrigins)
      return new Response(`Not found: ${key}`, { status: 404, headers })
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('accept-ranges', 'bytes')

    let status = 200
    if (request.headers.has('range') && object.range) {
      status = 206
      const start = object.range.offset
      const end = object.range.offset + object.range.length - 1
      headers.set('content-range', `bytes ${start}-${end}/${object.size}`)
      headers.set('content-length', String(object.range.length))
    } else {
      headers.set('content-length', String(object.size))
    }

    applyCors(headers, origin, allowedOrigins)

    if (request.method === 'HEAD') {
      return new Response(null, { status, headers })
    }

    return new Response(object.body, { status, headers })
  },
}

export default worker
