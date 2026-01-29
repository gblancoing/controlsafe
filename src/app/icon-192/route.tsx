import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e4d7b',
          borderRadius: 24,
        }}
      >
        <span
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          CS
        </span>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}
