import requests
import re
import os
import json
import exportfigmaconfig as config

FIGMA_FILE_KEY = config.FIGMA_FILE_KEY
FIGMA_TOKEN = config.FIGMA_TOKEN
MAIN_NODE_ID = config.MAIN_NODE_ID
OUTPUT_DIR = config.OUTPUT_DIR
SCALE = config.SCALE
ICONS_NODE_NAME = config.ICONS_NODE_NAME
PATH_NODE_NAME = config.PATH_NODE_NAME
ICON_FORMAT = config.ICON_FORMAT

if not FIGMA_TOKEN:
    print('FIGMA_TOKEN is required')
    exit()

if not FIGMA_FILE_KEY:
    print('FIGMA_FILE_KEY is required')
    exit()

if not MAIN_NODE_ID:
    print('MAIN_NODE_ID is required')
    exit()

if not OUTPUT_DIR:
    OUTPUT_DIR = './exported_icons'

if not SCALE:
    SCALE = 1

if not ICON_FORMAT:
    ICON_FORMAT = 'svg'

if not ICONS_NODE_NAME:
    ICONS_NODE_NAME = "24px"

if not PATH_NODE_NAME:
    PATH_NODE_NAME = "$icon-path"

headers = {"X-Figma-Token": FIGMA_TOKEN}

def find_node_by_name(parent, name):
    """find out child by name"""
    if "children" not in parent:
        return None
    for child in parent["children"]:
        if child.get("name") == name:
            return child
    return None

def get_title_name(title_node):
    """get text from node"""
    if not title_node or "characters" not in title_node:
        return None
    return title_node.get("characters", "unnamed")

def get_visible_images_from_group(icon_group_node):
    """get ID of visible child nodes from icon-group (light, dark, etc)"""
    if not icon_group_node or "children" not in icon_group_node:
        return []
    visible_icons = []
    for child in icon_group_node["children"]:
        if child.get("visible", True) is True:
            visible_icons.append(child)
    return visible_icons

def skip_fill_params(data):
    return re.sub(r'\s?(?:fill|stroke)="(?:none|black|currentColor)"',"",data)

def export_and_save_images(file_key, nodes, names_map, outputdir, scale=2):
    """export icons with names from names_map"""
    node_ids = [node["id"] for node in nodes]
    if not node_ids:
        return

    url = f"https://api.figma.com/v1/images/{file_key}"
    params = {
        "ids": ",".join(node_ids),
        "format": ICON_FORMAT,
        "scale": str(scale)
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        print(f"eport error: {response.status_code} — {response.text}")
        return

    data = response.json()
    if "err" in data and data['err']:
        print(f"Figma error: {data['err']}")
        return

    images = data.get("images", {})
    for node in nodes:
        node_id = node["id"]
        img_url = images.get(node_id)
        if not img_url:
            print(f"failed to export {node.get('name')} (ID: {node_id})")
            continue

        variant_name = node.get("name").lower().replace(" ", "_")
        base_name = names_map.get(node_id, "icon")
        # filename = os.path.join(outputdir, f"{base_name}_{variant_name}@{scale}x.svg")
        if 'rtl' in variant_name:
            base_name = base_name + '-rtl'
        filename = os.path.join(outputdir, f"{base_name}.{ICON_FORMAT}") if scale < 2 else os.path.join(outputdir, f"{base_name}@{scale}x.{ICON_FORMAT}")

        try:
            img_data = requests.get(img_url, timeout=15).content
            with open(filename, "wb") as f:
                skiped = skip_fill_params(img_data.decode('utf-8'))
                img_data = skiped.encode('utf-8')

                f.write(img_data)
            # print(f"done: {filename}")
        except Exception as e:
            print(f"Saving error {filename}: {e}")

def find_icon_name(node):
    icon_name_node = find_node_by_name(node, "$icon-name")
    if not icon_name_node:
        icon_name_node = find_node_by_name(find_node_by_name(node, "title"), "$icon-name")

    base_name = get_title_name(icon_name_node)
    if not base_name:
        base_name = "unnamed-" + node["id"].replace(":","-").replace(";","-")
        print(f"failed gitting icon name")

    return base_name

def find_path_for_icons_block(node):
    for child in node.get("children", []):
        if child.get("name") == PATH_NODE_NAME:
            return child.get("characters", "unnamed")
        elif child.get("name") != ICONS_NODE_NAME:
            path = find_path_for_icons_block(child)
            if path:
                return path

def find_icons_node(node):
    for child in node.get("children", []):
        # return child if child.get("name") == ICONS_NODE_NAME else find_icons_node(child)
        if child.get("name") == ICONS_NODE_NAME:
            return child
        else:
            find_icons_node(child)

def traverse_icons(mainnode):
    node_id = mainnode.get("id")
    path = find_path_for_icons_block(mainnode)
    if not path:
        print(f'path for node {node_id} not found')
        return

    icons_node = find_icons_node(mainnode)
    if not icons_node:
        print(f'icons node {node_id} was not found')
        return

    # search for child nodes with name "icon"
    icons = [child for child in icons_node.get("children", []) if child.get("name") == "icon"]

    if not icons:
        print("didn't found any 'icon' node")
        return

    print(f"found {len(icons)} icons")

    output_path = f'{OUTPUT_DIR}/{path}'
    os.makedirs(output_path, exist_ok=True)

    print('make dir', output_path)

    # collect items for export
    nodes_to_export = []
    names_map = {}  # node_id → base_name (из title-name)

    for icon in icons:
        # title_node = find_node_by_name(icon, "title")
        # title_node = find_node_by_name(icon, "$icon-name")
        icon_group_node = find_node_by_name(icon, "$icon-group")

        # get icon name
        base_name = find_icon_name(icon)

        # get visible items in group
        visible_icons = get_visible_images_from_group(icon_group_node)
        for node in visible_icons:
            nodes_to_export.append(node)
            names_map[node["id"]] = base_name

    if nodes_to_export:
        print(f"Экспортируем {len(nodes_to_export)} видимых иконок...")

        # with open("./child2.json", "w") as f:
        #     json.dump(nodes_to_export, f, indent=4)

        export_and_save_images(FIGMA_FILE_KEY, nodes_to_export, names_map, output_path, SCALE)
    else:
        print("🖼️ Нет видимых иконок для экспорта")

if __name__ == "__main__":
    print("load the main node...")
    url = f"https://api.figma.com/v1/files/{FIGMA_FILE_KEY}/nodes"
    params = {"ids": MAIN_NODE_ID}
    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        if MAIN_NODE_ID not in data.get("nodes", {}):
            print(f"node {MAIN_NODE_ID} wasn't found")
        else:
            main_node = data["nodes"][MAIN_NODE_ID]["document"]
            for child in main_node.get("children", []):
                if child.get('type') == 'FRAME':
                    traverse_icons(child)
    else:
        print(f"error: {response.status_code} — {response.text}")
