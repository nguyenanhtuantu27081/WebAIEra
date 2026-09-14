#!/usr/bin/env python3
"""
git_commit_api.py
Commit and push changes to GitHub using GitHub REST API.
Reads GITHUB_TOKEN and GITHUB_PATH from source/.env (or specified .env).
Does not require local git CLI.
"""

import os
import sys
import json
import base64
import hashlib
import fnmatch
import urllib.request
import urllib.error
import argparse
from typing import Dict, List, Tuple, Optional, Set

DEFAULT_ENV_FILE = os.path.join("source", ".env")

# Built-in ignore rules (safety + standard exclusions)
SAFETY_IGNORE_PATTERNS = [
    # Never commit credentials or environment files
    "*.env",
    "*.env.*",
    ".env*",
    "**/.env*",
    "source/.env",
    "workflows/.env",
    "*.pem",
    "*.key",
    
    # Git & IDE internals
    ".git",
    ".git/*",
    ".vscode",
    ".vscode/*",
    ".idea",
    ".idea/*",
    ".DS_Store",
    "Thumbs.db",
    "*.swp",
    "*.swo",
    
    # Dependencies & build outputs
    "node_modules",
    "node_modules/*",
    ".pnp",
    ".pnp.js",
    "coverage",
    "coverage/*",
    ".next",
    ".next/*",
    "out",
    "out/*",
    "build",
    "build/*",
    "dist",
    "dist/*",
    "*.tsbuildinfo",
    "next-env.d.ts",
    ".eslintcache",
    
    # Workspace & scratch artifacts
    ".agent",
    ".agent/*",
    ".agents",
    ".agents/*",
    ".gemini",
    ".gemini/*",
    "scratch",
    "scratch/*",
    "WebAIEra.zip",
    "*.zip",
    
    # Temporary scratch scripts
    "scratch_scan.ps1",
    "check_source.js",
    "ai-era-site/*.py",
    "ai-era-site/js/three/nodes_old.js",
]

def load_env_file(filepath: str) -> Dict[str, str]:
    env_vars = {}
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Environment file not found: {filepath}")
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                env_vars[key.strip()] = val.strip().strip("\"'")
    return env_vars

def parse_github_path(url_or_path: str) -> Tuple[str, str]:
    """Extract (owner, repo) from GitHub URL or owner/repo format."""
    clean = url_or_path.strip().rstrip("/")
    if clean.endswith(".git"):
        clean = clean[:-4]
    if "github.com/" in clean:
        parts = clean.split("github.com/")[-1].split("/")
        if len(parts) >= 2:
            return parts[0], parts[1]
    elif "/" in clean:
        parts = clean.split("/")
        if len(parts) == 2:
            return parts[0], parts[1]
    raise ValueError(f"Could not parse owner and repo from GITHUB_PATH: {url_or_path}")

def git_blob_sha(data: bytes) -> str:
    """Compute standard Git blob SHA-1."""
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()

class GitHubAPI:
    def __init__(self, token: str, owner: str, repo: str):
        self.token = token
        self.owner = owner
        self.repo = repo
        self.base_url = f"https://api.github.com/repos/{owner}/{repo}"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "WebAIEra-Sync-Tool"
        }

    def _request(self, endpoint: str, method: str = "GET", data: Optional[dict] = None) -> dict:
        url = endpoint if endpoint.startswith("https://") else f"{self.base_url}{endpoint}"
        body = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=body, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                if resp.status == 204:
                    return {}
                res_body = resp.read().decode("utf-8")
                return json.loads(res_body) if res_body else {}
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"GitHub API error {e.code} on {method} {url}: {err_msg}")

    def get_repo_info(self) -> dict:
        return self._request("")

    def get_branch_head(self, branch: str) -> str:
        data = self._request(f"/git/ref/heads/{branch}")
        return data["object"]["sha"]

    def get_commit(self, commit_sha: str) -> dict:
        return self._request(f"/git/commits/{commit_sha}")

    def get_tree(self, tree_sha: str) -> List[dict]:
        data = self._request(f"/git/trees/{tree_sha}?recursive=1")
        return data.get("tree", [])

    def create_blob(self, content_bytes: bytes) -> str:
        b64_content = base64.b64encode(content_bytes).decode("ascii")
        payload = {
            "content": b64_content,
            "encoding": "base64"
        }
        res = self._request("/git/blobs", method="POST", data=payload)
        return res["sha"]

    def create_tree(self, base_tree_sha: str, tree_items: List[dict]) -> str:
        payload = {
            "base_tree": base_tree_sha,
            "tree": tree_items
        }
        res = self._request("/git/trees", method="POST", data=payload)
        return res["sha"]

    def create_commit(self, message: str, tree_sha: str, parent_shas: List[str]) -> str:
        payload = {
            "message": message,
            "tree": tree_sha,
            "parents": parent_shas
        }
        res = self._request("/git/commits", method="POST", data=payload)
        return res["sha"]

    def update_branch_ref(self, branch: str, commit_sha: str, force: bool = False) -> dict:
        payload = {
            "sha": commit_sha,
            "force": force
        }
        return self._request(f"/git/refs/heads/{branch}", method="PATCH", data=payload)


def load_ignore_patterns(root_dir: str) -> List[str]:
    patterns = list(SAFETY_IGNORE_PATTERNS)
    gitignore_path = os.path.join(root_dir, ".gitignore")
    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                patterns.append(line)
    return patterns

def is_path_ignored(rel_path: str, patterns: List[str]) -> bool:
    posix_path = rel_path.replace("\\", "/")
    filename = os.path.basename(posix_path)

    # Strict safety check: Never commit any .env file
    if filename == ".env" or filename.startswith(".env.") or filename.endswith(".env"):
        return True

    for pat in patterns:
        pat_clean = pat.rstrip("/")
        if fnmatch.fnmatch(posix_path, pat) or fnmatch.fnmatch(posix_path, pat_clean):
            return True
        if fnmatch.fnmatch(filename, pat) or fnmatch.fnmatch(filename, pat_clean):
            return True
        if pat.endswith("/*"):
            prefix = pat[:-2]
            if posix_path == prefix or posix_path.startswith(prefix + "/"):
                return True
        if "/" not in pat:
            # Matches any directory/file with that name in hierarchy
            parts = posix_path.split("/")
            if any(fnmatch.fnmatch(part, pat) for part in parts):
                return True
        elif posix_path.startswith(pat_clean + "/"):
            return True
    return False

def scan_workspace(root_dir: str, patterns: List[str], remote_blobs: Dict[str, str]) -> Tuple[List[str], List[str], List[str]]:
    """Scan local directory vs remote tree. Returns (modified, added, deleted)."""
    modified = []
    added = []
    local_files_found = set()

    for root, dirs, files in os.walk(root_dir):
        # Filter directories to avoid scanning into ignored folders
        dirs[:] = [
            d for d in dirs
            if not is_path_ignored(os.path.relpath(os.path.join(root, d), root_dir), patterns)
        ]

        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, root_dir)
            if is_path_ignored(rel_path, patterns):
                continue
            
            posix_path = rel_path.replace("\\", "/")
            local_files_found.add(posix_path)

            try:
                with open(full_path, "rb") as fp:
                    content = fp.read()
            except Exception as e:
                print(f"[WARN] Cannot read {posix_path}: {e}")
                continue

            sha_raw = git_blob_sha(content)
            # Check normalized CRLF -> LF for text files
            content_lf = content.replace(b"\r\n", b"\n")
            sha_lf = git_blob_sha(content_lf)

            if posix_path in remote_blobs:
                rem_sha = remote_blobs[posix_path]
                if rem_sha != sha_raw and rem_sha != sha_lf:
                    modified.append(posix_path)
            else:
                added.append(posix_path)

    # Deleted files: exists in remote blobs but no longer locally and not ignored
    deleted = []
    for rpath in remote_blobs:
        if is_path_ignored(rpath, patterns):
            continue
        if rpath not in local_files_found:
            deleted.append(rpath)

    return sorted(modified), sorted(added), sorted(deleted)

def main():
    parser = argparse.ArgumentParser(description="Commit files to GitHub repository using REST API.")
    parser.add_argument("--env-file", default=DEFAULT_ENV_FILE, help="Path to .env file containing GITHUB_TOKEN and GITHUB_PATH")
    parser.add_argument("--branch", default=None, help="Target branch (default: repo default branch)")
    parser.add_argument("-m", "--message", help="Commit message")
    parser.add_argument("--status", "--dry-run", action="store_true", help="Preview changes without committing")
    parser.add_argument("--yes", "-y", action="store_true", help="Execute commit without interactive confirmation")
    args = parser.parse_args()

    workspace_dir = os.path.abspath(".")
    env_path = os.path.join(workspace_dir, args.env_file)
    if not os.path.exists(env_path):
        # Fallback to current directory .env if source/.env not found
        fallback = os.path.join(workspace_dir, ".env")
        if os.path.exists(fallback):
            env_path = fallback
        else:
            print(f"[ERROR] Could not find env file at {env_path}")
            sys.exit(1)

    print(f"[*] Reading configuration from {os.path.relpath(env_path, workspace_dir)}...")
    env_vars = load_env_file(env_path)
    github_token = env_vars.get("GITHUB_TOKEN")
    github_path = env_vars.get("GITHUB_PATH")

    if not github_token:
        print("[ERROR] GITHUB_TOKEN not found in env file.")
        sys.exit(1)
    if not github_path:
        print("[ERROR] GITHUB_PATH not found in env file.")
        sys.exit(1)

    owner, repo = parse_github_path(github_path)
    print(f"[*] Repository: {owner}/{repo}")

    api = GitHubAPI(github_token, owner, repo)

    try:
        repo_info = api.get_repo_info()
    except Exception as e:
        print(f"[ERROR] Failed to connect to repository {owner}/{repo}: {e}")
        sys.exit(1)

    branch = args.branch or repo_info.get("default_branch", "main")
    print(f"[*] Target branch: {branch}")

    # Fetch latest commit and remote tree
    head_sha = api.get_branch_head(branch)
    head_commit = api.get_commit(head_sha)
    base_tree_sha = head_commit["tree"]["sha"]
    print(f"[*] Head commit: {head_sha[:8]} (Tree: {base_tree_sha[:8]})")

    remote_tree_items = api.get_tree(base_tree_sha)
    remote_blobs = {item["path"]: item["sha"] for item in remote_tree_items if item["type"] == "blob"}

    patterns = load_ignore_patterns(workspace_dir)
    modified, added, deleted = scan_workspace(workspace_dir, patterns, remote_blobs)

    print("\n" + "="*50)
    print(" GIT STATUS (COMPARED TO REMOTE GITHUB)")
    print("="*50)
    total_changes = len(modified) + len(added) + len(deleted)
    if total_changes == 0:
        print("Working tree is clean. Nothing to commit.")
        sys.exit(0)

    if modified:
        print(f"\nModified files ({len(modified)}):")
        for f in modified:
            print(f"  M {f}")

    if added:
        print(f"\nAdded files ({len(added)}):")
        for f in added:
            print(f"  A {f}")

    if deleted:
        print(f"\nDeleted files ({len(deleted)}):")
        for f in deleted:
            print(f"  D {f}")

    print("="*50)
    print(f"Total changes: {total_changes} ({len(added)} added, {len(modified)} modified, {len(deleted)} deleted)\n")

    if args.status:
        print("[INFO] Status check complete (dry-run mode).")
        return

    commit_message = args.message
    if not commit_message:
        commit_message = input("Enter commit message (or Ctrl+C to cancel): ").strip()
        if not commit_message:
            print("[ERROR] Commit message cannot be empty.")
            sys.exit(1)

    if not args.yes:
        confirm = input(f"Commit and push {total_changes} changes to '{branch}'? [y/N]: ").strip().lower()
        if confirm != "y" and confirm != "yes":
            print("[*] Aborted by user.")
            sys.exit(0)

    print("\n[*] Uploading blobs to GitHub API...")
    tree_payload_items = []

    # Upload modified and added files
    files_to_upload = modified + added
    for idx, rpath in enumerate(files_to_upload, 1):
        full_path = os.path.join(workspace_dir, rpath.replace("/", os.sep))
        print(f"  [{idx}/{len(files_to_upload)}] Uploading blob for {rpath}...")
        with open(full_path, "rb") as fp:
            data = fp.read()
        # Normalizing line endings for text files to avoid unnecessary CRLF diffs
        ext = os.path.splitext(rpath)[1].lower()
        if ext in [".html", ".css", ".js", ".ts", ".tsx", ".json", ".md", ".txt", ".xml", ".yml", ".yaml", ".conf"]:
            data = data.replace(b"\r\n", b"\n")
        blob_sha = api.create_blob(data)
        tree_payload_items.append({
            "path": rpath,
            "mode": "100644",
            "type": "blob",
            "sha": blob_sha
        })

    # Add deleted files with sha=None
    for rpath in deleted:
        print(f"  Marking deleted: {rpath}")
        tree_payload_items.append({
            "path": rpath,
            "mode": "100644",
            "type": "blob",
            "sha": None
        })

    print(f"[*] Creating new git tree with {len(tree_payload_items)} changes...")
    new_tree_sha = api.create_tree(base_tree_sha, tree_payload_items)
    print(f"    Tree SHA: {new_tree_sha}")

    print(f"[*] Creating commit: \"{commit_message}\"...")
    new_commit_sha = api.create_commit(commit_message, new_tree_sha, [head_sha])
    print(f"    Commit SHA: {new_commit_sha}")

    print(f"[*] Updating branch '{branch}' to commit {new_commit_sha[:8]}...")
    api.update_branch_ref(branch, new_commit_sha)

    print("\n" + "="*50)
    print(f" SUCCESS! Commit pushed to GitHub.")
    print(f" Branch: {branch}")
    print(f" Commit URL: https://github.com/{owner}/{repo}/commit/{new_commit_sha}")
    print("="*50)

if __name__ == "__main__":
    main()
