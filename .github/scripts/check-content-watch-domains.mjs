/* Keeps content-watch's safe-outputs.allowed-domains in sync with content-sources.yml.
   gh-aw redacts any URL whose domain isn't allow-listed (see safe-outputs docs), and the
   redaction breaks the digest's markdown link syntax. Without this check, adding a new
   active source without also allow-listing its domain fails silently: the digest issue
   just ships with broken/redacted links for that source until someone notices. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseSources } from './prepare-content-watch.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const errors = [];

const sources = parseSources(readFileSync(join(root, '.github/content-sources.yml'), 'utf8'));
const workflowText = readFileSync(join(root, '.github/workflows/content-watch.md'), 'utf8');

function extractAllowedDomains(text) {
  const frontmatterEnd = text.indexOf('\n---', 4);
  const frontmatter = text.slice(0, frontmatterEnd === -1 ? undefined : frontmatterEnd);
  const lines = frontmatter.split(/\r?\n/);
  const startIndex = lines.findIndex(line => /^\s*allowed-domains:\s*$/.test(line));
  if (startIndex === -1) return null;

  const indent = lines[startIndex].match(/^(\s*)/)[1].length;
  const domains = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const itemMatch = line.match(/^(\s*)-\s*(.+)$/);
    if (!itemMatch || itemMatch[1].length <= indent) break;
    domains.push(itemMatch[2].trim().replace(/^["']|["']$/g, ''));
  }
  return domains;
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Domains gh-aw's safe-outputs sanitizer always allows regardless of allowed-domains
// (see safe-outputs-runtime.md: "GitHub domains are always included by default").
const ALWAYS_ALLOWED = /(^|\.)github\.com$/;

function isCovered(hostname, allowedDomains) {
  if (ALWAYS_ALLOWED.test(hostname)) return true;
  return allowedDomains.some(domain => {
    if (domain.startsWith('*.')) {
      const suffix = domain.slice(1); // ".example.com"
      return hostname === domain.slice(2) || hostname.endsWith(suffix);
    }
    return hostname === domain;
  });
}

const allowedDomains = extractAllowedDomains(workflowText);
if (!allowedDomains) {
  errors.push('content-watch.md: safe-outputs.allowed-domains is missing (every active source URL will be redacted)');
} else {
  const hostnames = new Set();
  for (const source of sources) {
    if (!source.active) continue;
    const hostname = hostnameOf(source.url);
    if (!hostname) {
      errors.push(`source "${source.id}": could not parse a hostname from url "${source.url}"`);
      continue;
    }
    hostnames.add(hostname);
    if (source.learn && source.learn.base_url) {
      const learnHostname = hostnameOf(source.learn.base_url);
      if (learnHostname) hostnames.add(learnHostname);
    }
  }

  for (const hostname of hostnames) {
    if (!isCovered(hostname, allowedDomains)) {
      errors.push(`"${hostname}" is not in content-watch.md's safe-outputs.allowed-domains — its links will render as (redacted)`);
    }
  }
}

if (errors.length) {
  for (const e of errors) console.error(`  ERROR ${e}`);
  console.error(`\n${errors.length} error(s). Add the missing domain(s) to safe-outputs.allowed-domains in .github/workflows/content-watch.md, then recompile with "gh aw compile".`);
  process.exit(1);
}
console.log('content-watch allowed-domains covers every active source.');
