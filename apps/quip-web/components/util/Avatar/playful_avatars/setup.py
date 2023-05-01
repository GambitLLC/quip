#write me a script that renames all the svgs in the following directories to have .vue extensions (make sure they do not keep the .svg extension)
# 1. accessories/
# 2. eyes/
# 3. face/
# 4. hair/
# 5. mouth/
# 6. outfit/

import os

def rename_files(path):
    for filename in os.listdir(path):
        if filename.endswith(".svg"):
            os.rename(os.path.join(path, filename), os.path.join(path, filename[:-4] + ".vue"))

# write me a function that changes the contents of the file to be a vue component, the file should look like this:
# <script setup lang="ts">
# </script>
# <template>
# THE CONTENTS OF THE SVG FILE GO HERE
# </template>
# <style scoped lang="scss">
# </style>

def change_file_contents(path):
    rename_files(path)

    for filename in os.listdir(path):
        if filename.endswith(".vue"):
            with open(os.path.join(path, filename), "r+") as f:
                contents = f.read()
                f.seek(0)
                f.write('<script setup lang="ts">\n</script>\n\n<template>\n' + contents + '</template>\n\n<style scoped lang="scss">\n</style>')
                f.truncate()

change_file_contents("accessories")
change_file_contents("eyes")
change_file_contents("face")
change_file_contents("hair")
change_file_contents("mouth")
change_file_contents("outfit")