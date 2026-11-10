#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

echo "Running bounded vinext build..."
if command -v timeout >/dev/null; then
  timeout \
    --signal=TERM \
    --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
    "${SITES_BUILD_TIMEOUT:-3m}" \
    "${vinext}" build
else
  # macOS does not ship GNU timeout. Keep a hard deadline without requiring
  # a global package installation or changing the project's lockfile.
  node --input-type=module - "${vinext}" "${SITES_BUILD_TIMEOUT:-3m}" <<'NODE'
import { spawnSync } from "node:child_process";
const [bin, duration] = process.argv.slice(2);
const match = duration.match(/^(\d+(?:\.\d+)?)(ms|s|m|h)?$/);
if (!match) throw new Error(`Unsupported build timeout: ${duration}`);
const unit = { ms: 1, s: 1000, m: 60000, h: 3600000 }[match[2] ?? "s"];
const result = spawnSync(bin, ["build"], {
  stdio: "inherit", timeout: Number(match[1]) * unit, killSignal: "SIGKILL",
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
NODE
fi

"${script_dir}/validate-artifact.sh"
