"""Generate Printful photo mockups for every product and save them into public/mockups.

Print files must already be live at https://blazedkitty.com/prints/ (see render-prints.ts).
Auth: PRINTFUL_API_TOKEN env var, or a proxy that injects the token for api.printful.com.

Run from the repo root:  python3 scripts/printful_mockups.py [slug ...]
Writes public/mockups/<slug>/<n>.jpg and lib/mockups.json.
"""
import json
import os
import subprocess
import sys
import time
import urllib.request

API = "https://api.printful.com"
SITE = os.environ.get("PRINT_BASE", "https://blazedkitty.com/prints")
TOKEN = os.environ.get("PRINTFUL_API_TOKEN", "")

STYLES = {
    "crop": ["Women's Lifestyle", "Women's Lifestyle 2", "Women's", "Flat"],
    "tank": ["Women's", "Flat Lifesytle", "Flat"],
    "bikini": ["Women's Lifestyle", "Women's Lifestyle 2", "Women's", "Flat Lifestyle"],
}
AREA = {"crop": (1500, 1500), "tank": (1050, 1200), "bikini": (7500, 3300)}


def call(method, path, body=None):
    for attempt in range(8):
        req = urllib.request.Request(API + path, method=method)
        if TOKEN:
            req.add_header("Authorization", f"Bearer {TOKEN}")
        req.add_header("Content-Type", "application/json")
        data = json.dumps(body).encode() if body is not None else None
        try:
            with urllib.request.urlopen(req, data, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            text = e.read().decode(errors="replace")
            if e.code == 429:
                wait = 20 + attempt * 10
                print(f"  rate limited, waiting {wait}s")
                time.sleep(wait)
                continue
            raise SystemExit(f"{method} {path} -> {e.code}: {text[:400]}")
    raise SystemExit("too many retries")


def catalog():
    out = subprocess.run(
        ["npx", "-y", "tsx", "-e", "import {PRODUCTS} from './lib/products'; console.log(JSON.stringify(PRODUCTS))"],
        capture_output=True, text=True, check=True)
    return json.loads(out.stdout.strip().splitlines()[-1])


def pick_variants(product_id, colors, garment):
    variants = call("GET", f"/products/{product_id}")["result"]["variants"]
    picked = []
    for c in colors:
        want = "white" if garment == "bikini" else c["name"].lower()
        match = [v for v in variants if want in v["color"].lower() and v["size"] == "M"]
        if not match:
            raise SystemExit(f"no M variant for color {c['name']} on product {product_id}")
        picked.append((c["name"], match[0]["id"]))
    return picked


def main():
    only = set(sys.argv[1:])
    products = [p for p in catalog() if not only or p["slug"] in only]
    manifest_path = "lib/mockups.json"
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}

    for p in products:
        g = p["garment"]
        w, h = AREA[g]
        ext = "jpg" if g == "bikini" else "png"
        url = f"{SITE}/{p['design']}.{ext}"
        pos = {"area_width": w, "area_height": h, "width": w, "height": h, "top": 0, "left": 0}
        files = ([{"placement": "top", "image_url": url, "position": pos},
                  {"placement": "bottom", "image_url": url, "position": pos}]
                 if g == "bikini" else [{"placement": "front", "image_url": url, "position": pos}])
        variants = pick_variants(p["printful"]["productId"], p["colors"], g)
        print(f"{p['slug']}: {len(variants)} color(s), styles {STYLES[g]}")
        task = call("POST", f"/mockup-generator/create-task/{p['printful']['productId']}", {
            "variant_ids": [vid for _, vid in variants],
            "format": "jpg",
            "files": files,
            "option_groups": STYLES[g],
        })["result"]
        key = task["task_key"]
        for _ in range(60):
            time.sleep(5)
            res = call("GET", f"/mockup-generator/task?task_key={key}")["result"]
            if res["status"] == "completed":
                break
            if res["status"] == "failed":
                raise SystemExit(f"{p['slug']} failed: {res.get('error')}")
        else:
            raise SystemExit(f"{p['slug']} timed out")

        color_by_vid = {vid: name for name, vid in variants}
        folder = f"public/mockups/{p['slug']}"
        os.makedirs(folder, exist_ok=True)
        images = []
        n = 0
        for m in res["mockups"]:
            color = next((color_by_vid[v] for v in m["variant_ids"] if v in color_by_vid), p["colors"][0]["name"])
            shots = [{"url": m["mockup_url"], "style": m.get("placement", "front"), "option": "Main"}]
            shots += [{"url": e["url"], "style": e.get("title", ""), "option": e.get("option", "")} for e in m.get("extra", [])]
            for s in shots:
                n += 1
                path = f"{folder}/{n}.jpg"
                urllib.request.urlretrieve(s["url"], path)
                images.append({"src": f"/mockups/{p['slug']}/{n}.jpg", "color": color, "style": s["style"], "option": s["option"]})
        manifest[p["slug"]] = images
        print(f"  saved {len(images)} images")
        json.dump(manifest, open(manifest_path, "w"), indent=1)
        time.sleep(8)  # stay under the mockup task rate limit


if __name__ == "__main__":
    main()
