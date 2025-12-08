import psycopg2
import json

DB = dict(
    dbname='vrisa',
    user='vrisa_project',
    password='vr!sa2024',
    host='localhost',
    port=5432,
)

query = """
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'station'
ORDER BY ordinal_position;
"""

try:
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()
    cur.execute(query)
    cols = [r[0] for r in cur.fetchall()]
    print(json.dumps(cols))
    cur.close()
    conn.close()
except Exception as e:
    print('ERROR', str(e))
    raise
