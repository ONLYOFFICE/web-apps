import sys
import json
import os.path

lost_key_count, sum_key_count = 0, 0

merge_dicts = True
verbose_out = False
#path_to_compare = "../apps/documenteditor/mobile/locale"
path_to_compare = "../apps"
#json_pattern = f'{path_to_compare}/en.json'

cmd_args = sys.argv[1:]
for i in cmd_args:
    if i == '--check':
	    merge_dicts = False
    elif i == '--verbose':
        verbose_out = True
    elif i[:2] != '--' and os.path.isdir(i):
        path_to_compare = i
        #json_pattern = f'{path_to_compare}/en.json'

def compareDicts(keypath, dict1, dict2):
    global lost_key_count, sum_key_count

    for k, v in dict1.items():
        k_path = f'{keypath}{"." if len(keypath) else ""}{k}'
        if isinstance(v, dict):
            if k not in dict2:
                dict2[k] = {}

            dict2[k] = compareDicts(k_path, v, dict2[k])
        else:
            sum_key_count += 1
            if not k.startswith("del_") and k not in dict2:
                lost_key_count += 1
                dict2[k] = v
                if verbose_out: print(f'  key {k_path} not exists')
    return dict2

def compareFile(mjson, path):
    with open(path, 'r+', encoding='utf-8') as cf:
        res_dict = compareDicts('', mjson, json.load(cf))
        
        if merge_dicts and lost_key_count:
            cf.seek(0)
            cf.write(json.dumps(res_dict, indent = 2, ensure_ascii=False))
            cf.truncate()

def compareJsonInFolder(path):
    global lost_key_count, sum_key_count

    cwd = os.path.dirname(path)
    print('compare path', cwd, '\n')
    with open(path, 'r') as pf:
        master_dict = json.load(pf)

        #for root, dirs, files in os.walk(os.path.dirname(path)):
            #for f in files:
        files = [f for f in os.listdir(cwd) if os.path.isfile(os.path.join(cwd, f))]
        for f in files:
            if f != 'en.json' and f[-5:] == '.json':
                if verbose_out: print(f'{f} is processing...')

                lost_key_count, sum_key_count = 0, 0
                compareFile(master_dict, f'{cwd}/{f}')
                print(f'{f} done, lost {lost_key_count} from {sum_key_count}')
                print('')

if os.path.exists(f'{path_to_compare}/en.json'):
    compareJsonInFolder(f'{path_to_compare}/en.json')
else:
    for editor in ['documenteditor','spreadsheeteditor','presentationeditor','pdfeditor']:
        path = f'{path_to_compare}/{editor}/main/locale/en.json'
        if os.path.exists(path):
            compareJsonInFolder(path)
        else: print(f'wrong path: {path}')
