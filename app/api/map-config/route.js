export async function GET() {
  return Response.json({
    key: process.env.NEXT_PUBLIC_MAPPLS_KEY,
  });
}
