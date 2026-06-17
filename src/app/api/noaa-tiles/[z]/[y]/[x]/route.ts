const NOAA_TILE_BASE_URL =
  'https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/NOAACharts/MapServer/tile'

export const runtime = 'nodejs'

type RouteParams = {
  params: Promise<{
    z: string
    y: string
    x: string
  }>
}

const isNumericPathToken = (token: string) => /^\d+$/.test(token)

export async function GET(_request: Request, context: RouteParams) {
  const { z, y, x } = await context.params

  if (!isNumericPathToken(z) || !isNumericPathToken(y) || !isNumericPathToken(x)) {
    return new Response('Invalid tile coordinates', { status: 400 })
  }

  const upstreamUrl = `${NOAA_TILE_BASE_URL}/${z}/${y}/${x}`
  const upstream = await fetch(upstreamUrl, {
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
    cache: 'force-cache',
  })

  if (!upstream.ok || !upstream.body) {
    return new Response('NOAA tile unavailable', { status: upstream.status || 502 })
  }

  const contentType = upstream.headers.get('content-type') || 'image/png'
  const cacheControl = upstream.headers.get('cache-control') || 'public, max-age=86400'

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type': contentType,
      'cache-control': cacheControl,
    },
  })
}
