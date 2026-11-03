import urllib.request, json, sqlite3, sys

API = "https://jatu-register-api.onrender.com/api/list"
DB = "/home/sirasit/jaturathat-registration/server/data/jatu-oct23.db"

try:
    with urllib.request.urlopen(API, timeout=20) as r:
        data = json.load(r)
    rows = data.get("rows", [])
    if not rows:
        sys.exit(0)

    db = sqlite3.connect(DB)
    cols = [c[1] for c in db.execute("PRAGMA table_info(registrations)")]
    existing = set()
    for (e, f, l) in db.execute("SELECT event, firstName, lastName FROM registrations"):
        existing.add((e or "", f or "", l or ""))

    added = []
    for x in rows:
        key = (x.get("event") or "", x.get("firstName") or "", x.get("lastName") or "")
        if key in existing:
            continue
        vals = [None if c == "id" else x.get(c) for c in cols]
        placeholders = ",".join("?" for _ in cols)
        db.execute("INSERT INTO registrations (%s) VALUES (%s)" % (",".join(cols), placeholders), vals)
        added.append(x)
    db.commit()

    yk = db.execute("SELECT COUNT(*) FROM registrations WHERE event='yamkang-oct31'").fetchone()[0]
    jt = db.execute("SELECT COUNT(*) FROM registrations WHERE event='jatu-oct23'").fetchone()[0]
    db.close()

    # แจ้งเฉพาะเมื่อมีคนใหม่ (ไม่แจ้งถ้าไม่มีอะไรเปลี่ยน)
    if added:
        lines = ["📥 มีผู้ลงทะเบียนใหม่ %d คน" % len(added), ""]
        for x in added:
            lines.append("• %s%s %s · %s" % (
                x.get("title") or "", x.get("firstName") or "",
                x.get("lastName") or "", x.get("event") or ""))
        lines.append("")
        lines.append("ย่ำข่าง %d คน · จตุรธาตุ %d คน" % (yk, jt))
        print("\n".join(lines))
except Exception:
    pass
