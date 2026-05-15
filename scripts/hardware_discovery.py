#!/usr/bin/env python3
"""
Hardware Auto-Discovery via cmconfig (version 1.10.x)
------------------------------------------------------
Uses `cmconfig topology` to enumerate all hardware devices on the local network:
  - Capture Modules (CM CAN Combo, CM Ethernet, etc.)  → fed into CMInterface / CANInterface fields
  - Network Adapters (NetAdapter)                       → fed into EthernetAdapter.friendlyName / interface

Usage (standalone):
    python hardware_discovery.py                  # pretty-print JSON result
    python hardware_discovery.py --json           # compact JSON (for piping)

Usage (from Node.js / VS Code extension):
    const { execSync } = require('child_process');
    const result = JSON.parse(execSync('python hardware_discovery.py --json').toString());
"""

import json
import subprocess
import sys
import os
from typing import Any

# ---------------------------------------------------------------------------
# Locate the cmconfig binary bundled with the Python package
# ---------------------------------------------------------------------------

def _find_cmconfig_exe() -> str:
    """Return the path to the cmconfig executable (prefers venv-installed one)."""
    from importlib.resources import files, as_file
    from platform import system

    try:
        with as_file(files("cmconfig") / "bin") as bin_dir:
            exe = str(bin_dir / system().lower() / "cmconfig")
            if system().lower() == "windows":
                exe += ".exe" if not exe.endswith(".exe") else ""
            if os.path.isfile(exe):
                return exe
    except Exception:
        pass

    # Fallback: cmconfig on PATH
    import shutil
    path_exe = shutil.which("cmconfig") or shutil.which("cmconfig.exe")
    if path_exe:
        return path_exe

    raise FileNotFoundError(
        "cmconfig binary not found. Install it with: pip install cmconfig==1.10.0"
    )


# ---------------------------------------------------------------------------
# Run cmconfig commands and capture stdout
# ---------------------------------------------------------------------------

def _run_cmconfig(*args: str, timeout: int = 15) -> str:
    """Run the cmconfig binary with given args and return stdout as a string."""
    exe = _find_cmconfig_exe()
    try:
        result = subprocess.run(
            [exe, *args],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            text=True,
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"cmconfig {' '.join(args)} timed out after {timeout}s")
    except FileNotFoundError:
        raise RuntimeError("cmconfig binary could not be executed")


# ---------------------------------------------------------------------------
# Parse topology JSON
# ---------------------------------------------------------------------------

def _parse_topology(raw_json: str) -> dict[str, Any]:
    """
    Parse the raw JSON from `cmconfig topology`.

    Returns a dict with two lists:
      - "capture_modules"  : list of CM devices (non-NetAdapter)
      - "ethernet_adapters": list of host network adapters (NetAdapter)
    """
    if not raw_json:
        return {"capture_modules": [], "ethernet_adapters": []}

    try:
        data: dict = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        raise ValueError(f"cmconfig topology returned invalid JSON: {exc}")

    capture_modules: list[dict] = []
    ethernet_adapters: list[dict] = []

    for dev in data.get("devices", []):
        product_family: str = dev.get("product_family", "")
        device_info: dict = dev.get("device") or {}
        host_info: dict = dev.get("host") or {}

        if product_family == "NetAdapter":
            # Host-side network adapter – used to fill EthernetAdapter fields
            ethernet_adapters.append({
                "friendly_name": device_info.get("name", ""),       # e.g. "Ethernet 4"
                "description":   device_info.get("description", ""),# e.g. "Realtek USB GbE Family Controller"
                "ip":            device_info.get("ip", ""),
                "mac":           device_info.get("mac", ""),
                "ports": _extract_ports(dev.get("ports", [])),
            })
        else:
            # Capture Module (CM CAN Combo, CM Ethernet, etc.)
            capture_modules.append({
                "id":             dev.get("id", 0),                  # cmId for CMInterface/CANInterface
                "product_family": product_family,
                "product_id":     dev.get("product_id"),             # for validation
                "product_name":   dev.get("product_name"),
                "sw_version":     dev.get("version"),
                "hw_version":     dev.get("hw_version"),
                "name":           device_info.get("name", ""),       # human-readable label
                "description":    device_info.get("description", ""),
                "ip":             device_info.get("ip", ""),         # network address
                "mac":            device_info.get("mac", ""),
                # If the CM sits behind a host adapter, capture that adapter info
                "host_adapter": {
                    "name": host_info.get("name", ""),
                    "ip":   host_info.get("ip", ""),
                    "mac":  host_info.get("mac", ""),
                } if host_info else None,
                "ports": _extract_ports(dev.get("ports", [])),
            })

    return {
        "capture_modules":   capture_modules,
        "ethernet_adapters": ethernet_adapters,
    }


def _extract_ports(ports: list) -> list[dict]:
    """Extract relevant port info from a device's ports list."""
    result = []
    for p in ports:
        result.append({
            "name":          p.get("name", ""),
            "short_name":    p.get("short_name", ""),
            "link_type":     p.get("link_type", ""),
            "link_protocol": p.get("link_protocol", ""),
            "linkup":        p.get("linkup", False),
            "speed":         p.get("speed", 0),
            "interface_id":  p.get("interface_id"),
        })
    return result


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def discover_hardware(timeout: int = 15) -> dict[str, Any]:
    """
    Run `cmconfig topology`, parse the result, and return a structured dict:

    {
      "capture_modules": [
        {
          "id": 3,
          "product_family": "CAN_Combo",
          "product_id": 1171,
          "product_name": "CM CAN Combo",
          "sw_version": "21.7.60",
          "name": "CM CAN Combo",
          "ip": "10.104.3.64",
          "mac": "38:2A:19:00:3E:13",
          "host_adapter": { "name": "Ethernet 4", "ip": "...", "mac": "..." },
          "ports": [...]
        },
        ...
      ],
      "ethernet_adapters": [
        {
          "friendly_name": "Ethernet",
          "description": "Realtek Gaming GbE Family Controller",
          "ip": "fe80::...",
          "mac": "48:9E:BD:11:42:FC",
          "ports": [...]
        },
        ...
      ]
    }

    The `id` field of each capture module corresponds directly to the `cmId`
    field on CMInterface / CANInterface models in the VS Code extension.

    The `friendly_name` of each ethernet adapter corresponds to
    EthernetAdapter.friendlyName.
    """
    raw = _run_cmconfig("topology", timeout=timeout)
    return _parse_topology(raw)


def get_valid_cm_ids(timeout: int = 15) -> list[int]:
    """Return the list of valid cmId values detected on the network."""
    result = discover_hardware(timeout=timeout)
    return [cm["id"] for cm in result["capture_modules"]]


def get_ethernet_adapter_names(timeout: int = 15) -> list[str]:
    """Return the list of friendly adapter names available on this host."""
    result = discover_hardware(timeout=timeout)
    return [a["friendly_name"] for a in result["ethernet_adapters"] if a["friendly_name"]]


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    compact = "--json" in sys.argv

    try:
        result = discover_hardware()
    except Exception as exc:
        error = {"error": str(exc), "capture_modules": [], "ethernet_adapters": []}
        print(json.dumps(error, indent=None if compact else 2))
        sys.exit(1)

    indent = None if compact else 2
    print(json.dumps(result, indent=indent))
