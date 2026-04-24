export default function Home() {
  return (
    <main style={{
      backgroundColor: '#1C1C1C',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <h1 style={{
        color: 'white',
        fontSize: '48px',
        fontWeight: '900',
        letterSpacing: '-1px',
      }}>
        Xakkhi <span style={{ color: '#F77F00' }}>সাক্ষী</span>
      </h1>
      <p style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '16px',
        marginTop: '12px',
      }}>
        Dibrugarh&apos;s Civic Eye — Coming Soon
      </p>
    </main>
  );
}