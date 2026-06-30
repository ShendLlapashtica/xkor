export default async function handler(req, res) {
  const { path } = req.query;
  if (!path || !path.startsWith('/cars/report/')) {
    return res.status(400).end();
  }

  const upstream = await fetch(`https://fem.encar.com${path}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'sq,en;q=0.5',
      'Referer': 'https://fem.encar.com/',
    }
  });

  let html = await upstream.text();

  html = html
    .replace(/(src|href)="\/(?!\/)/g, '$1="https://fem.encar.com/')
    .replace(/(src|href)='\/(?!\/)/g, "$1='https://fem.encar.com/")
    .replace(/url\(\/(?!\/)/g, 'url(https://fem.encar.com/');

  html = html.replace('<head>', '<head><base href="https://fem.encar.com/">');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  res.status(200).send(html);
}
