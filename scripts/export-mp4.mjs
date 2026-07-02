#!/usr/bin/env node
/**
 * Export the explainer animation to MP4.
 * Usage: npm run export:mp4 [-- --fps 24] [-- --out explainer.mp4]
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FRAMES_DIR = join(ROOT, '.export-frames');
const DEFAULT_OUT = join(ROOT, 'claude-vs-perry-explainer.mp4');

function parseArgs(argv) {
  const opts = { fps: 24, out: DEFAULT_OUT, port: 5199 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--fps') opts.fps = Number(argv[++i]) || 24;
    else if (argv[i] === '--out') opts.out = resolve(argv[++i]);
    else if (argv[i] === '--port') opts.port = Number(argv[++i]) || 5199;
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error(`Server not ready: ${url}`);
}

async function startViteServer(port) {
  const server = await createServer({
    root: ROOT,
    configFile: join(ROOT, 'vite.config.js'),
    server: { port, strictPort: true, host: '127.0.0.1' },
  });
  await server.listen();
  const url = `http://127.0.0.1:${port}/`;
  await waitForServer(url);
  return { server, url };
}

function runFfmpeg(args) {
  return new Promise((resolvePromise, reject) => {
    const proc = spawn(ffmpegInstaller.path, args, { stdio: 'inherit' });
    proc.on('error', reject);
    proc.on('close', (code) => (code === 0 ? resolvePromise() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}

async function waitForFonts(page) {
  await page.waitForFunction(() => {
    const svg = document.querySelector('svg[data-om-exportable-video-with-duration-secs]');
    return svg?.getAttribute('data-om-fonts-inlined') === 'true';
  }, { timeout: 60000 });
}

async function prepareExportSurface(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-omelette-chrome]').forEach((el) => {
      el.style.display = 'none';
    });
    const svg = document.querySelector('svg[data-om-exportable-video-with-duration-secs]');
    if (svg) {
      svg.style.transform = 'none';
      svg.style.boxShadow = 'none';
    }
    const stage = document.querySelector('#root > div');
    if (stage) {
      stage.style.background = '#0a0a0a';
    }
  });
}

async function seekTo(page, time) {
  await page.evaluate((t) => {
    const svg = document.querySelector('svg[data-om-exportable-video-with-duration-secs]');
    if (!svg) throw new Error('Export canvas not found');
    svg.dispatchEvent(new CustomEvent('data-om-seek-to-time-frame', { detail: { time: t } }));
  }, time);
  await page.evaluate(() => new Promise((r) => {
    requestAnimationFrame(() => requestAnimationFrame(r));
  }));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { server, url } = await startViteServer(opts.port);

  let browser;
  try {
    if (existsSync(FRAMES_DIR)) await rm(FRAMES_DIR, { recursive: true, force: true });
    await mkdir(FRAMES_DIR, { recursive: true });

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    });

    console.log(`Loading ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await waitForFonts(page);
    await prepareExportSurface(page);

    const duration = await page.evaluate(() => {
      const svg = document.querySelector('svg[data-om-exportable-video-with-duration-secs]');
      return Number(svg?.getAttribute('data-om-exportable-video-with-duration-secs') || 0);
    });
    if (!duration) throw new Error('Could not read animation duration');

    const frameCount = Math.ceil(duration * opts.fps);
    const svg = page.locator('svg[data-om-exportable-video-with-duration-secs]');

    console.log(`Exporting ${duration}s @ ${opts.fps}fps → ${frameCount} frames`);

    for (let i = 0; i < frameCount; i++) {
      const time = Math.min(i / opts.fps, duration);
      await seekTo(page, time);
      const framePath = join(FRAMES_DIR, `frame_${String(i).padStart(6, '0')}.png`);
      await svg.screenshot({ path: framePath, type: 'png' });
      if (i % 60 === 0 || i === frameCount - 1) {
        const pct = Math.round((i / (frameCount - 1)) * 100);
        console.log(`  ${pct}% — frame ${i + 1}/${frameCount} (${time.toFixed(2)}s)`);
      }
    }

    console.log('Encoding MP4…');
    await runFfmpeg([
      '-y',
      '-framerate', String(opts.fps),
      '-i', join(FRAMES_DIR, 'frame_%06d.png'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      opts.out,
    ]);

    console.log(`Done: ${opts.out}`);
  } finally {
    if (browser) await browser.close();
    await server.close();
    if (existsSync(FRAMES_DIR)) await rm(FRAMES_DIR, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
