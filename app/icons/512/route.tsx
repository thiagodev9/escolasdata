import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 112,
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <span style={{
          color: '#ffffff',
          fontSize: 180,
          fontWeight: 900,
          letterSpacing: '-8px',
          lineHeight: 1,
          fontFamily: 'sans-serif',
        }}>
          KTX
        </span>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 9999,
          background: '#F97316',
          marginTop: 16,
        }} />
      </div>
    ),
    { width: 512, height: 512 }
  )
}
