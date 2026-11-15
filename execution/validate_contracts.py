#!/usr/bin/env python3
"""
validate_contracts.py
─────────────────────
Layer 3 (Execution) – Deterministic contract validation script.
Checks that project boundaries and TypeScript type contracts are respected.

Usage:
    python execution/validate_contracts.py
    npm run validate-contracts

Exit codes:
    0 – All checks passed
    1 – One or more violations found
"""

import os
import sys
import re
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
SRC = ROOT / "src"

BOUNDARY_RULES = [
    # (owner, owned_path, forbidden_imports_pattern, description)
    (
        "Shalev (features)",
        SRC / "features",
        r"from ['\"]@/core/routes",
        "features/ must not import from core/routes/",
    ),
    (
        "Yishai (live-session)",
        SRC / "live-session",
        r"from ['\"]@/features",
        "live-session/ must not import from features/",
    ),
    (
        "Leon (components)",
        SRC / "components",
        r"from ['\"]@/core/store",
        "components/ must not import from core/store/ (no business logic in UI)",
    ),
    (
        "Leon (components)",
        SRC / "components",
        r"from ['\"]@/features",
        "components/ must not import from features/",
    ),
]

REQUIRED_FILES = [
    SRC / "types" / "patient.types.ts",
    SRC / "types" / "session.types.ts",
    SRC / "types" / "character.types.ts",
    SRC / "types" / "websocket.types.ts",
    SRC / "core" / "api" / "axiosClient.ts",
    SRC / "core" / "store" / "useAuthStore.ts",
    SRC / "core" / "routes" / "AppRouter.tsx",
    SRC / "live-session" / "hooks" / "useLiveSessionSocket.ts",
]

ENV_REQUIRED_VARS = [
    "VITE_API_BASE_URL",
    "VITE_WS_BASE_URL",
]

# ── Helpers ───────────────────────────────────────────────────────────────────
errors: list[str] = []
warnings: list[str] = []

def check(condition: bool, message: str, is_warning: bool = False) -> None:
    if not condition:
        (warnings if is_warning else errors).append(message)


def print_header(title: str) -> None:
    print(f"\n{'─' * 60}")
    print(f"  {title}")
    print(f"{'─' * 60}")


# ── Checks ────────────────────────────────────────────────────────────────────
def check_required_files() -> None:
    print_header("1. Required Files")
    for f in REQUIRED_FILES:
        exists = f.exists()
        status = "✅" if exists else "❌"
        print(f"  {status} {f.relative_to(ROOT)}")
        check(exists, f"Missing required file: {f.relative_to(ROOT)}")


def check_boundary_violations() -> None:
    print_header("2. Module Boundary Violations")
    found_violations = False

    for owner, path, pattern, description in BOUNDARY_RULES:
        if not path.exists():
            continue
        for ts_file in path.rglob("*.ts[x]"):
            content = ts_file.read_text(encoding="utf-8", errors="ignore")
            for line_num, line in enumerate(content.splitlines(), 1):
                if re.search(pattern, line):
                    msg = f"  ❌ BOUNDARY VIOLATION [{owner}]\n     {ts_file.relative_to(ROOT)}:{line_num}\n     {line.strip()}\n     Rule: {description}"
                    print(msg)
                    errors.append(description)
                    found_violations = True

    if not found_violations:
        print("  ✅ No boundary violations detected")


def check_no_any_in_types() -> None:
    print_header("3. Type Safety (no 'any' in src/types/)")
    types_dir = SRC / "types"
    found_any = False

    if not types_dir.exists():
        print("  ⚠️  src/types/ not found — skipping")
        return

    for ts_file in types_dir.rglob("*.ts"):
        content = ts_file.read_text(encoding="utf-8", errors="ignore")
        for line_num, line in enumerate(content.splitlines(), 1):
            if re.search(r":\s*any\b", line) and not line.strip().startswith("//"):
                print(f"  ⚠️  any type found: {ts_file.relative_to(ROOT)}:{line_num}: {line.strip()}")
                warnings.append(f"any type in {ts_file.name}:{line_num}")
                found_any = True

    if not found_any:
        print("  ✅ No explicit 'any' types in src/types/")


def check_env_example() -> None:
    print_header("4. .env.example Coverage")
    env_file = ROOT / ".env.example"

    if not env_file.exists():
        errors.append(".env.example missing")
        print("  ❌ .env.example not found")
        return

    content = env_file.read_text(encoding="utf-8")
    for var in ENV_REQUIRED_VARS:
        found = var in content
        status = "✅" if found else "❌"
        print(f"  {status} {var}")
        check(found, f"Missing env var in .env.example: {var}")


def check_websocket_hook_exists() -> None:
    print_header("5. WebSocket Hook Contract")
    hook = SRC / "live-session" / "hooks" / "useLiveSessionSocket.ts"

    if not hook.exists():
        errors.append("useLiveSessionSocket.ts missing")
        print("  ❌ useLiveSessionSocket.ts not found")
        return

    content = hook.read_text(encoding="utf-8")
    checks = [
        ("exports useLiveSessionSocket", "useLiveSessionSocket"),
        ("uses native WebSocket", "new WebSocket("),
        ("handles reconnect", "reconnect"),
        ("sends session.join", "session.join"),
    ]
    for desc, pattern in checks:
        found = pattern in content
        status = "✅" if found else "⚠️ "
        print(f"  {status} {desc}")
        check(found, f"WebSocket hook missing: {desc}", is_warning=True)


# ── Main ──────────────────────────────────────────────────────────────────────
def main() -> None:
    print("\n🔍  Therapist Back-Office – Contract Validator")
    print(f"    Root: {ROOT}")

    check_required_files()
    check_boundary_violations()
    check_no_any_in_types()
    check_env_example()
    check_websocket_hook_exists()

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'═' * 60}")
    if errors:
        print(f"\n❌  {len(errors)} ERROR(S) found:")
        for e in errors:
            print(f"    • {e}")
    if warnings:
        print(f"\n⚠️   {len(warnings)} WARNING(S):")
        for w in warnings:
            print(f"    • {w}")
    if not errors and not warnings:
        print("\n✅  All contract checks passed!")
    elif not errors:
        print(f"\n✅  No errors (but {len(warnings)} warning(s) to review)")
    print(f"{'═' * 60}\n")

    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()

