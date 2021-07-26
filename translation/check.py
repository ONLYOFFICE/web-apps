import sys
import json
import os.path

lost_key_count, sum_key_count = 0, 0

merge_dicts = False
verbose_out = False
path_to_compare = "../apps/documenteditor/mobile/locale"
json_pattern = f'{path_to_compare}/en.json'

print('compare path', path_to_compare)

cmd_args = sys.argv[1:]
for i in cmd_args:
    if i == '--merge':
        merge_dicts = True
    elif i == '--verbose':
        verbose_out = True
    elif i[:2] != '--' and os.path.isdir(i):
        path_to_compare = i
        json_pattern = f'{path_to_compare}/en.json'

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
            if k not in dict2:
                lost_key_count += 1
                dict2[k] = v
                if verbose_out: print(f'  key {k_path} not exists')
    return dict2

def compareFile(mjson, path):
    with open(path, 'r+', encoding='utf-8') as cf:
        res_dict = compareDicts('', mjson, json.load(cf))
        
        if merge_dicts and lost_key_count:
            cf.seek(0)
            cf.write(json.dumps(res_dict, indent = 4))
            cf.truncate()

if os.path.exists(json_pattern):
    with open(json_pattern, 'r') as pf:
        master_dict = json.load(pf)

        for root, dirs, files in os.walk(path_to_compare):
            for f in files:
                if f != 'en.json':
                    if verbose_out: print(f'{f} is processing...')

                    lost_key_count, sum_key_count = 0, 0
                    compareFile(master_dict, f'{root}/{f}')
                    print(f'{f} done, lost {lost_key_count} from {sum_key_count}\n')

else: print('wrong path')