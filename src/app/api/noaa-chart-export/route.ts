const NOAA_EXPORT_BASE_URL =
  'https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/Gridded_NOAA_ENC/MapServer/export'

export const runtime = 'nodejs'

const isNumeric = (value: string) => /^-?\d+(\.\d+)?$/.test(value)

const isValidBbox = (bbox: string) => {
  const parts = bbox.split(',')
  return parts.length === 4 && parts.every((part) => isNumeric(part.trim()))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const bbox = url.searchParams.get('bbox')

  if (!bbox || !isValidBbox(bbox)) {
    return new Response('Invalid bbox parameter', { status: 400 })
  }

  const upstreamUrl =
    `${NOAA_EXPORT_BASE_URL}?bbox=${encodeURIComponent(bbox)}` +
    '&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image'

  const upstream = await fetch(upstreamUrl, {
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
    cache: 'force-cache',
  })

  if (!upstream.ok || !upstream.body) {
    return new Response('NOAA chart export unavailable', {
      status: upstream.status || 502,
    })
  }

  const contentType = upstream.headers.get('content-type') || 'image/png'
  const cacheControl = upstream.headers.get('cache-control') || 'public, max-age=3600'
  const imageBuffer = Buffer.from(await upstream.arrayBuffer())

  return new Response(imageBuffer, {
    status: 200,
    headers: {
      'content-type': contentType,
      'cache-control': cacheControl,
    },
  })
}
