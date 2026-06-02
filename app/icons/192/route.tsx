import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <span style={{
          color: '#ffffff',
          fontSize: 68,
          fontWeight: 900,
          letterSpacing: '-3px',
          lineHeight: 1,
          fontFamily: 'sans-serif',
        }}>
          KTX
        </span>
        <div style={{
          width: 16,
          height: 16,
          borderRadius: 9999,
          background: '#F97316',
          marginTop: 6,
        }} />
      </div>
    ),
    { width: 192, height: 192 }
  )
}
