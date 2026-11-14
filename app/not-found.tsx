import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="sec">
      <div className="wrap notfound">
        <p className="whisper">this kitty wandered off</p>
        <h1>Page not found</h1>
        <p className="lede">The link might be old, or the piece is gone.</p>
        <Link href="/shop" className="btn">Back to the shop</Link>
      </div>
    </section>
  );
}
