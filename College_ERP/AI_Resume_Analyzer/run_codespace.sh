#!/usr/bin/env bash
# Sets up and starts the AI Resume Analyzer inside a GitHub Codespace.
#
#   ./run_codespace.sh                 install (first time only) and start the app
#   ./run_codespace.sh --with-browser  also install Google Chrome, needed only for the LinkedIn Jobs page
#
# Then open port 8501 from the "Ports" tab.
set -euo pipefail
cd "$(dirname "$0")"

# VS Code often activates some other project's virtual environment in new terminals.
# "pip install --user" fails inside one, so step out of it first (only affects this script).
if [ -n "${VIRTUAL_ENV:-}" ]; then
  PATH="$(printf '%s' "$PATH" | tr ':' '\n' | grep -vxF "$VIRTUAL_ENV/bin" | paste -sd: -)"
  unset VIRTUAL_ENV
  hash -r
fi

# This project needs Python 3.11 (its pinned libraries do not exist for the newer Python in a Codespace).
# "uv" downloads Python 3.11 by itself, so no sudo or apt is needed.
UV="$(command -v python3) -m uv"
if ! $UV --version >/dev/null 2>&1; then
  echo "Installing uv..."
  python3 -m pip install --user --quiet uv
fi

if [ ! -x venv/bin/python ] || ! venv/bin/python -c "import sys; sys.exit(0 if sys.version_info[:2] == (3, 11) else 1)"; then
  echo "Creating a Python 3.11 environment..."
  rm -rf venv
  $UV venv --python 3.11 venv
fi
# shellcheck disable=SC1091
source venv/bin/activate

if [ ! -f venv/.installed ] || [ requirements.txt -nt venv/.installed ]; then
  echo "Installing packages. The first time this takes several minutes."
  # The CPU-only build of torch is about 10x smaller than the default one (no GPU in a Codespace).
  $UV pip install --python venv/bin/python torch --index-url https://download.pytorch.org/whl/cpu \
    || echo "Could not get the CPU-only torch; the default build will be used (bigger download)."
  $UV pip install --python venv/bin/python -r requirements.txt
  touch venv/.installed
fi

if [ "${1:-}" = "--with-browser" ]; then
  if command -v google-chrome >/dev/null 2>&1 || command -v chromium >/dev/null 2>&1; then
    echo "A browser is already installed."
  else
    echo "Installing Google Chrome (for the LinkedIn Jobs page)..."
    TMP_DEB="$(mktemp --suffix=.deb)"
    curl -fsSL -o "$TMP_DEB" https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
    sudo apt-get update -qq
    sudo apt-get install -y -qq "$TMP_DEB"
    rm -f "$TMP_DEB"
  fi
fi

echo
echo "Starting the app on port 8501 - open it from the Ports tab (not localhost)."
# CORS and XSRF protection are switched off because the Codespaces port forwarder sits in front of Streamlit;
# with them on, uploading a PDF fails with "AxiosError: status code 403".
exec streamlit run app.py \
  --server.headless true \
  --server.address 0.0.0.0 \
  --server.port 8501 \
  --server.enableCORS false \
  --server.enableXsrfProtection false
