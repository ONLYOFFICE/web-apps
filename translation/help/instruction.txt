Для работы скрипта сборки спрайта картинок нужен python версии 3.6+

Для добавления картинки общей для всех языков
1. Откройте папку web-apps/apps/common/main/resources/help/images/src, если картинка используется как минимум в двух редакторах
   или web-apps/apps/{редактор}/main/resources/help/images/src, если картинка используется только в одном редакторе:
    a) изображение кнопки или иконки положите в папку"icons". название картинки будет соответствовать названию селектора для css;
    b) более крупное изображение положите в папку "big";
    c) символ в папку "symbols".

2. Запустите терминал(командную строку)

3. Передите в папку  web-apps/translation/help c помощью команды: cd путь_к_папке
    (ВНИМАНИЕ! [для windows] ecли папка лежит не на дике С, перейти на другой диск  можно комадой "cd Буква_диска:" после нажать "enter" ([Пример:] cd F:))

4. Запустить скрипт командой: python helpsprite.py

   если команда выдаст ошибку "ModuleNotFoundError: No module named 'PIL'", нужно выполнить в терминале
   для windows: python -m pip install Pillow
   для остальных os: python pip install Pillow

   если при выполнении появилась ошибка "ImportError: cannot import name '_imaging' from 'PIL'....", нужно выполнить
   для windows:
        python -m pip uninstall Pillow
        python -m pip install Pillow

    для остальных os:
        python pip uninstall Pillow
        python pip install Pillow

5. Пример использования картинки из спрайта
   Чтобы добавить картинку в текст страницы нужно вставить:
    a) Для изображений из папки icons:
        <div class="icon icon-имя_файла_без_расширения"></div>
    b) Для изображений из папки big:
        <div class="big big-имя_файла_без_расширения"></div>
    c) Для изображений из папки big:
        <div class="smb smb-имя_файла_без_расширения"></div>
