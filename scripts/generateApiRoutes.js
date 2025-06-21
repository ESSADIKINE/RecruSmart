const fs = require('fs');
const path = require('path');

function getRouteFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(getRouteFiles(filePath));
    } else if (/routes?\.js$/i.test(file) || file === 'auth.js') {
      results.push(filePath);
    }
  }
  return results;
}

function parseRoutes(content) {
  const endpoints = [];
  const regex = /router\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/;
  for (const line of content.split(/\r?\n/)) {
    const match = regex.exec(line);
    if (match) endpoints.push({ method: match[1].toUpperCase(), path: match[2] });
  }
  return endpoints;
}

function generate() {
  const baseDir = path.join(__dirname, '..', 'backend');
  const services = fs.readdirSync(baseDir);
  const result = {};
  for (const svc of services) {
    if (!svc.startsWith('service-')) continue;
    const servicePath = path.join(baseDir, svc);
    const files = getRouteFiles(servicePath);
    const endpoints = [];
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      endpoints.push(...parseRoutes(content));
    }
    if (endpoints.length) result[svc] = endpoints;
  }
  const out = path.join(__dirname, '..', 'frontend', 'src', 'apiRoutes.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2));
  console.log(`Generated API routes to ${out}`);
}

if (require.main === module) generate();
