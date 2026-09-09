// Local classroom database only. Never reads production credentials.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
const env = { ...process.env, DATABASE_URL: 'postgresql://workshop@127.0.0.1:55439/workshop' };
const name = 'lidr-frontend-session-db';
function run(command, args) {
  const r = spawnSync(command, args, { env, stdio: 'inherit' });
  if (r.error || r.status !== 0) throw new Error(`${command} failed`);
}
async function main() {
  if (process.argv[2] === 'start') {
    run('npm', ['run', 'dev']);
    return;
  }
  if (process.argv[2] !== 'setup') throw new Error('Use setup or start');
  const exists = spawnSync('docker', ['container', 'inspect', name], { stdio: 'ignore' });
  if (exists.status === 0) run('docker', ['start', name]);
  else run('docker', ['run', '-d', '--name', name, '-p', '127.0.0.1:55439:5432', '-e', 'POSTGRES_USER=workshop', '-e', 'POSTGRES_DB=workshop', '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:17']);
  let ready = false;
  for (let n = 0; n < 30; n++) {
    if (spawnSync('docker', ['exec', name, 'pg_isready', '-U', 'workshop'], { stdio: 'ignore' }).status === 0) { ready = true; break; }
    await new Promise(r => setTimeout(r, 1000));
  }
  if (!ready) throw new Error('Postgres did not become ready');
  run('npx', ['prisma', 'generate']);
  run('npx', ['prisma', 'migrate', 'deploy']);
  run('node', ['scripts/session-seed.cjs']);
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
