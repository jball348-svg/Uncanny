import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'Uncanny — AI Detection for Fiction Writers'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: '#0a0a0a',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 'bold', letterSpacing: '-0.05em', marginBottom: 24 }}>
          Uncanny
        </div>
        <div style={{ fontSize: 48, color: '#a3a3a3' }}>
          AI Detection for Fiction Writers
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
