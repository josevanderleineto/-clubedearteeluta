import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = process.cwd();
const templatePath = resolve(rootDir, 'scripts/config.template.yml');
const adminOutputPath = resolve(rootDir, 'public/admin/config.yml');
const rootOutputPath = resolve(rootDir, 'public/config.yml');

function normalizeSiteUrl(value) {
  if (!value) return 'http://localhost:5173';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
}

function envOrDefault(name, fallback) {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

export async function generateCmsConfig() {
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

  await mkdir(dirname(adminOutputPath), { recursive: true });
  await writeFile(adminOutputPath, generated, 'utf8');
  await writeFile(rootOutputPath, generated, 'utf8');

  if (githubRepo === 'OWNER/REPO') {
    console.warn(
      '[CMS] CMS_GITHUB_REPO was not set. Decap CMS will not be able to save content until you set it in Vercel or locally.'
    );
  }

  console.log(`[CMS] Generated ${adminOutputPath}`);
  console.log(`[CMS] Generated ${rootOutputPath}`);
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  generateCmsConfig().catch((error) => {
    console.error('[CMS] Failed to generate config:', error);
    process.exit(1);
  });
}
