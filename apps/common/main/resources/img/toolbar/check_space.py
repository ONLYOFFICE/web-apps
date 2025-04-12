import os
import sys

def rename_files_remove_space(directory):
    try:
        # Get list of all files in directory
        for filename in os.listdir(directory):
            # Check if filename starts with space
            if filename.startswith(' '):
                # Create new filename without the first character
                new_filename = filename[1:]
                
                # Create full paths
                old_path = os.path.join(directory, filename)
                new_path = os.path.join(directory, new_filename)
                
                # Rename file
                os.rename(old_path, new_path)
                print(f'Renamed: "{filename}" -> "{new_filename}"')
    
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python rename_files.py <directory_path>")
        sys.exit(1)
    
    directory = sys.argv[1]
    
    if not os.path.exists(directory):
        print(f"Error: Directory '{directory}' does not exist")
        sys.exit(1)
    
    if not os.path.isdir(directory):
        print(f"Error: '{directory}' is not a directory")
        sys.exit(1)
    
    success = rename_files_remove_space(directory)
    if success:
        print("File renaming completed successfully")
