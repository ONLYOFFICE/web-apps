import os
import io
import shutil

def strSplit(str):
    result = []
    ind1 = str.find('"')
    ind2 = str.find('"', ind1+1)
    result.append(str[ind1+1:ind2])
    ind3 = str.find('"', ind2+1)
    indLast = str.rfind('"')
    result.append(str[ind3+1:indLast])
    return result


def sortByAlphabet(inputStr):
    return inputStr.lower()


app_names = ['documenteditor', 'presentationeditor', 'spreadsheeteditor', 'pdfeditor']
app_types = ['embed', 'main', 'forms']
prefix_apps = '../apps/'
prefix_src = 'src/'
prefix_dest = 'dest/'
str_apps = []
langs = []
for i in range(len(app_names)):
    for j in range(len(app_types)):
        locale_path = prefix_apps + app_names[i] + '/' + app_types[j] + '/locale/'
        src_path = prefix_src + app_names[i] + '/' + app_types[j] + '/locale/'
        dest_path = prefix_dest + app_names[i] + '/' + app_types[j] + '/locale/'
        print(locale_path)
        if os.path.isdir(locale_path):
            langs = os.listdir(locale_path)
            if not os.path.isdir(dest_path):
                os.makedirs(dest_path)
            if len(langs) > 0:
                try:
                    f = io.open(locale_path + 'en.json', mode='r', encoding='utf-8')
                except Exception:
                    continue
                lines = f.readlines()
                f.close()
                str_apps = []
                for k in range(1, len(lines)-1):
                    arr = strSplit(lines[k])
                    if len(arr) > 0:
                        str_apps.append(arr[0])
                str_apps.sort(key=sortByAlphabet)
                for l in range(len(langs)):
                    lang = langs[l].split('.')[0]
                    f = io.open(locale_path + lang+ '.json', mode='r', encoding='utf-8')
                    lines = f.readlines()
                    f.close()
                    try:
                        f = io.open(src_path + lang+ '.json', mode='r', encoding='utf-8')
                    except Exception:
                        f.close()
                        f = io.open(dest_path + lang + '.json', mode='w', encoding='utf-8')
                        f.writelines(lines)
                        f.close()
                        print('    ' + lang+ '.json - copied')
                        continue
                    d_locale = dict()
                    d_src = dict()
                    # locale
                    for k in range(1, len(lines)-1):
                        arr = strSplit(lines[k])
                        if len(arr) > 1:
                            d_locale[arr[0]] = arr[1]
                    # src
                    lines = f.readlines()
                    for k in range(1, len(lines)-1):
                        arr = strSplit(lines[k])
                        if len(arr) > 1:
                            d_src[arr[0]] = arr[1]
                    f.close()
                    f = io.open(dest_path + lang + '.json', mode='w', encoding='utf-8')
                    f.write(u'{')
                    f.write(u'\n')
                    changed = 'not changed'
                    isFirst = True
                    arr_len = len(str_apps)
                    for k in range(arr_len):
                        str = str_apps[k]
                        if str.find('del_') == 0:
                            continue
                        if str in d_src:
                            changed = 'changed'
                            str = '  "' + str + '": "' + d_src[str] + '"'
                            if isFirst:
                                isFirst = False
                            else:
                                f.write(u',\n')
                            f.write(str)
                        elif str in d_locale:
                            str = '  "' + str + '": "' + d_locale[str] + '"'
                            if isFirst:
                                isFirst = False
                            else:
                                f.write(u',\n')
                            f.write(str)
                    f.write(u'\n')
                    f.write(u'}')
                    f.close()
                    print('    ' + lang + '.json - ' + changed)
            if os.path.isdir(src_path):
                add_langs = os.listdir(src_path)
                for m in range(len(langs)):
                    if add_langs.count(langs[m]) > 0:
                        add_langs.remove(langs[m])
                for m in range(len(add_langs)):
                    lang = add_langs[m]
                    shutil.copyfile(src_path + lang, dest_path + lang)
                    print('    ' + lang + ' - ' + 'added')
