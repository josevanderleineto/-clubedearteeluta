import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const rootDir = process.cwd();
const templatePath = resolve(rootDir, 'scripts/config.template.yml');
const outputPath = resolve(rootDir, 'public/admin/config.yml');

function normalizeSiteUrl(value) {
  if (!value) return 'http://localhost:5173';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
}

function envOrDefault(name, fallback) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

async function main() {
  const template = await readFile(templatePath, 'utf8');

  const siteUrl = normalizeSiteUrl(
    envOrDefault('CMS_SITE_URL', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  );
  const siteDomain = new URL(siteUrl).hostname;
  const githubRepo = envOrDefault('CMS_GITHUB_REPO', 'OWNER/REPO');
  const githubBranch = envOrDefault('CMS_GITHUB_BRANCH', 'main');

  const generated = template
    .replaceAll('__CMS_GITHUB_REPO__', githubRepo)
    .replaceAll('__CMS_GITHUB_BRANCH__', githubBranch)
    .replaceAll('__CMS_SITE_DOMAIN__', siteDomain)
    .replaceAll('__CMS_BASE_URL__', siteUrl);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, generated, 'utf8');

  if (githubRepo === 'OWNER/REPO') {
    console.warn(
      '[CMS] CMS_GITHUB_REPO was not set. Decap CMS will not be able to save content until you set it in Vercel or locally.'
    );
  }

  console.log(`[CMS] Generated ${outputPath}`);
}

main().catch((error) => {
  console.error('[CMS] Failed to generate config:', error);
  process.exit(1);
});
