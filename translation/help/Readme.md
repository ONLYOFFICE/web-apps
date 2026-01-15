# Sprite Image Build Script Requirements

To run the sprite image build script, Python version 3.6 or higher is required.

# Adding an Image Common to All Languages

1. Open the folder:
   - `web-apps/apps/common/main/resources/help/images/src` if the image is used in at least two editors,
   - or `web-apps/apps/{editor}/main/resources/help/images/src` if the image is used in only one editor:
     * Place images for button or icon in the `icons` folder. The image name will correspond to the CSS selector name.
     * Place larger images in the `big` folder.
     * Place symbols in the `symbols` folder.

2. Launch the terminal (command line).

3. Navigate to the `web-apps/translation/help` folder using the command: `cd path_to_folder`
   - **NOTE!** [For Windows] If the folder is not on the C drive, switch to another drive using the command `cd Drive_Letter:` and then press `Enter` (e.g., `cd F:`).

4. Run the script with the command: `python helpsprite.py`

   - If the command returns an error `ModuleNotFoundError: No module named 'PIL'`, execute the following in the terminal:
     - For Windows: `python -m pip install Pillow`
     - For other OS: `python pip install Pillow`

   - If the error `ImportError: cannot import name '_imaging' from 'PIL'...` occurs, execute:
     - For Windows:
       ```bash
       python -m pip uninstall Pillow
       python -m pip install Pillow
       ```
     - For other OS:
       ```bash
       python pip uninstall Pillow
       python pip install Pillow
       ```

5. Example of Using an Image from the Sprite
   To add an image to the page text, insert:
   - For images from the `icons` folder:
     ```html
     <div class="icon icon-file_name_without_extension"></div>
     ```
   - For images from the `big` folder:
     ```html
     <div class="big big-file_name_without_extension"></div>
     ```
   - For images from the `symbols` folder:
     ```html
     <div class="smb smb-file_name_without_extension"></div>
     ```
