const fs = require('fs');
const path = require('path');
const handler = require('../../api/entry');
const cli = require('../../bin/cli');

describe('Agent Readiness & Modern AI-SEO Audit Verification', () => {
  const rootDir = path.resolve(__dirname, '../../');

  // Mock response helper for api/entry.js
  const createMockRes = () => {
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader(k, v) {
        this.headers[k.toLowerCase()] = v;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      send(data) {
        this.body = data;
        return this;
      },
    };
    return res;
  };

  test('Fix 1: Homepage raw HTML has >= 500 characters of meaningful content in #root', () => {
    const indexPath = path.join(rootDir, 'public', 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');
    const rootMatch = indexHtml.match(/<div id="root">([\s\S]*?)<\/div>/);
    expect(rootMatch).toBeTruthy();
    const rootContent = rootMatch[1].trim();
    expect(rootContent.length).toBeGreaterThanOrEqual(500);
    expect(rootContent).toContain('<h1>UPI Pay — Bulk UPI Payouts and Dynamic QR Terminal</h1>');
    expect(rootContent).toContain('<h2>UPI Pay Terminal & Bulk Payouts</h2>');
  });

  test('Fix 2 & Fix 3: Markdown negotiation on homepage returns 200, Vary: Accept, and Markdown body', () => {
    const req = {
      query: { path: '' },
      headers: { accept: 'text/markdown' },
    };
    const res = createMockRes();
    handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.headers['vary']).toBe('Accept');
    expect(res.body.length).toBeGreaterThan(100);
    expect(res.body).toContain('# UPI Pay');
    expect(res.body).toContain('## When to Use This');
  });

  test('Fix 2: Agent-friendly 404 returns HTTP 404 and Markdown body for unknown paths with Accept: text/markdown', () => {
    const req = {
      query: { path: 'some-path-that-does-not-exist' },
      headers: { accept: 'text/markdown' },
    };
    const res = createMockRes();
    handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.headers['vary']).toBe('Accept');
    expect(res.body.length).toBeGreaterThanOrEqual(20);
    expect(res.body).toContain('# 404 Not Found');
    expect(res.body).toContain('llms.txt');
    expect(res.body).toContain('sitemap.xml');
  });

  test('Fix 2: Unknown paths return HTTP 404 for HTML requests', () => {
    const req = {
      query: { path: 'some-path-that-does-not-exist' },
      headers: { accept: 'text/html' },
    };
    const res = createMockRes();
    handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.body).toContain('404 - Page Not Found');
  });

  test('Fix 4: Brand discoverability terms present in public/index.html', () => {
    const indexPath = path.join(rootDir, 'public', 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');
    expect(indexHtml).toContain('UPI Pay');
    expect(indexHtml).toContain('UPI Pay Terminal');
    expect(indexHtml).toContain('Rohit Kumar Ranjan');
  });

  test('Fix 5: llms.txt exists with When to Use This, CLI instructions, and URL specifications', () => {
    const llmsPath = path.join(rootDir, 'public', 'llms.txt');
    expect(fs.existsSync(llmsPath)).toBe(true);
    const content = fs.readFileSync(llmsPath, 'utf-8');
    expect(content).toContain('## When to Use This');
    expect(content).toContain('## Official CLI Tool');
    expect(content).toContain('@rohit124551/upi-pay');
    expect(content).toContain('## How an Agent Should Call UPI Pay');
    expect(content).toContain('/pay/:upiId/:amount/:desc');
  });

  test('Fix 6: Trust anchor pages (/about, /contact, /privacy) exist with >= 500 chars of raw HTML', () => {
    const pages = ['about', 'contact', 'privacy'];
    pages.forEach((page) => {
      const pagePath = path.join(rootDir, 'public', page, 'index.html');
      expect(fs.existsSync(pagePath)).toBe(true);
      const content = fs.readFileSync(pagePath, 'utf-8');
      expect(content.length).toBeGreaterThanOrEqual(500);
      expect(content).toContain('<html lang="en-IN">');
      expect(content).toContain(`<link rel="canonical" href="https://upi.rohitkumarranjan.in/${page}" />`);
    });
  });

  test('Fix 7 & Fix 8: Metadata completeness and JSON-LD WebApplication url', () => {
    const indexPath = path.join(rootDir, 'public', 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');
    expect(indexHtml).toContain('<link rel="canonical" href="https://upi.rohitkumarranjan.in/" />');
    expect(indexHtml).toContain('lang="en-IN"');
    expect(indexHtml).toContain('property="og:image"');
    expect(indexHtml).toContain('property="og:type"');

    // Check JSON-LD
    const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(jsonLdMatch).toBeTruthy();
    const data = JSON.parse(jsonLdMatch[1]);
    const webApp = data['@graph'].find((item) => item['@type'] === 'WebApplication');
    expect(webApp).toBeTruthy();
    expect(webApp.url).toBe('https://upi.rohitkumarranjan.in/');
    expect(webApp.keywords).toContain('UPI Pay');
    expect(webApp.keywords).toContain('UPI Pay Terminal');
  });

  test('Ora Requirement: Developer Portal at /developers with API keys, sandbox, and quickstart', () => {
    const devPath = path.join(rootDir, 'public', 'developers', 'index.html');
    expect(fs.existsSync(devPath)).toBe(true);
    const content = fs.readFileSync(devPath, 'utf-8');
    expect(content.length).toBeGreaterThanOrEqual(1000);
    expect(content).toContain('UPI Pay Developer Portal');
    expect(content).toContain('Quickstart Guide');
    expect(content).toContain('Interactive Dynamic QR Sandbox');
    expect(content).toContain('API Keys & Client Authentication');
    expect(content).toContain('Official CLI Tool');

    // Check markdown negotiation for /developers
    const req = { query: { path: 'developers' }, headers: { accept: 'text/markdown' } };
    const res = createMockRes();
    handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.body).toContain('UPI Pay Developer Portal');
  });

  test('Ora Requirement: CLI tool available with qr, parse, reconcile commands', () => {
    expect(cli.generateUpiUri).toBeDefined();
    expect(cli.VPA_REGEX.test('merchant@okaxis')).toBe(true);
    const uri = cli.generateUpiUri('merchant@okaxis', '499.00', 'Invoice 1042');
    expect(uri).toContain('upi://pay?pa=merchant%40okaxis');
    expect(uri).toContain('am=499.00');
    expect(uri).toContain('tn=Invoice%201042');

    // Check package.json has bin definition
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin['upi-pay']).toBe('./bin/cli.js');
  });
});
