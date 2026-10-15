#!/usr/bin/env python

import sys
sys.path.append('../../../build_tools/scripts')
import base
import json
import re

JSON_FILE = r"../../../document-formats/onlyoffice-docs-formats.json"

params = sys.argv[1:]
if (1 != len(params)):
  exit(0)

api_file = params[0]

with open(JSON_FILE, encoding="utf-8") as f:
  formats = json.load(f)

# Build list of (name, type) pairs, skip entries with empty type
pairs = [(item["name"], item["type"]) for item in formats if item.get("type")]

# Group names by type, preserving JSON order within each group
TYPE_ORDER = ["cell", "slide", "pdf", "word", "diagram"]
groups: dict[str, list[str]] = {t: [] for t in TYPE_ORDER}
for name, ftype in pairs:
  if ftype in groups:
    groups[ftype].append(name)

# Build the replacement regex line
group_parts = "|".join(f"({'|'.join(names)})" for names in groups.values())
new_line = f"                    var type = /^(?:{group_parts})$/"

print("new list of formats for web-apps:", group_parts)

api_content = base.readFile(api_file)
# with open(api_file, encoding="utf-8") as f:
    # api_content = f.read()

pattern = re.compile(r"[ \t]+var type = /\^\(\?:\(xls.*\$\/", re.MULTILINE)
match = pattern.search(api_content)
if match:
  new_api_content = api_content[:match.start()] + new_line + api_content[match.end():]

  base.delete_file(api_file)
  base.writeFile(api_file, new_api_content)
  # with open(api_file, "w", encoding="utf-8") as f:
    # f.write(new_api_content)
else:
  print('no match to replace formats in api')
