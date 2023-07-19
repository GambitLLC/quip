# write me a python script that takes in a .glb filename as an argument
# opens the .glb file, and serializes it to a json

import pygltflib
import sys
import json
from pygltflib.utils import ImageFormat
import os


def gltf_to_threejs(material_data):
    """
    Converts GLTF PBR material to Three.js MeshStandardMaterial parameters.

    Parameters:
        material_data (dict): A dictionary containing GLTF PBR material properties.

    Returns:
        dict: A dictionary containing Three.js MeshStandardMaterial parameters.
    """
    threejs_params = {}

    if 'pbrMetallicRoughness' in material_data:
        pbrData = material_data['pbrMetallicRoughness']

        # # Base color
        # if 'baseColorFactor' in pbrData:
        #     threejs_params['color'] = pbrData['baseColorFactor']

        # Metallic and Roughness
        if 'metallicFactor' in pbrData and 'roughnessFactor' in pbrData:
            threejs_params['metalness'] = pbrData['metallicFactor']
            threejs_params['roughness'] = pbrData['roughnessFactor']

        # Base color map
        if 'baseColorTexture' in pbrData:
            threejs_params['map'] = f"Texture{pbrData['baseColorTexture']['index']}"

        # Metallic and Roughness maps (if available)
        if 'metallicRoughnessTexture' in pbrData:
            threejs_params['metalnessMap'] = pbrData['metallicRoughnessTexture']['index']
            threejs_params['roughnessMap'] = pbrData['metallicRoughnessTexture']['index']

    # Specular (if available, convert to roughness)
    if 'specularFactor' in material_data:
        # Converting specular to roughness (specular = 1 - roughness)
        threejs_params['roughness'] = 1.0 - material_data['specularFactor']

    # Emissive color
    # if 'emissiveFactor' in material_data:
    #     threejs_params['emissive'] = material_data['emissiveFactor']

    # Alpha
    if 'alphaMode' in material_data and 'alphaCutoff' in material_data:
        alpha_mode = material_data['alphaMode'].lower()
        alpha_cutoff = material_data['alphaCutoff']

        if alpha_mode == 'mask':
            threejs_params['alphaTest'] = alpha_cutoff
        elif alpha_mode == 'blend':
            threejs_params['transparent'] = True

    # Double-sided
    if 'doubleSided' in material_data:
        threejs_params['side'] = 2 if material_data['doubleSided'] else 0

    # Normal map
    if 'normalTexture' in material_data:
        threejs_params['normalMap'] = material_data['normalTexture']['index']

    # AO map
    if 'occlusionTexture' in material_data:
        threejs_params['aoMap'] = material_data['occlusionTexture']['index']

    # Emissive map
    if 'emissiveTexture' in material_data:
        threejs_params['emissiveMap'] = material_data['emissiveTexture']['index']

    return threejs_params


newline = "\n"
quote = '"'
empty = ""


def template(mats, imports):
    return f"""
{newline.join(imports)}

const [
    {", ".join([f"Texture{i}" for i in range(len(imports))])}
] = useTexture([
    {", ".join([f"Image{i}" for i in range(len(imports))])}
])

const materials = {{
{newline.join([f"    {name}: new MeshStandardMaterial({json.dumps(mats[name]).replace(quote, empty)})," for name in mats])}
}}
    """


def main():
    # get the filename from the command line
    if (len(sys.argv) < 2):
        print("Usage: python fixer.py <filename>")
        return

    filename = sys.argv[1]

    justFileNameWithoutOtherStuff = filename.split("/")[-1]

    # load the glb file
    glb = pygltflib.GLTF2().load(filename)

    # serialize the glb file to json
    jsonStr = glb.to_json()

    # serialize the json to an object
    gltfObj = json.loads(jsonStr)

    materials = gltfObj["materials"]
    images = gltfObj["images"]

    # create textures folder
    if not os.path.exists("textures"):
        os.makedirs("textures")
        glb.convert_images(ImageFormat.FILE, "textures/")

    outMaterials = {}
    for material in materials:
        outMaterials[material["name"]] = gltf_to_threejs(material)

    imports = [
        "import { MeshStandardMaterial } from \"three\";",
        f"import modelPath from './{justFileNameWithoutOtherStuff}"
    ]

    for i in range(len(images)):
        imageExt = images[i]["mimeType"].split("/")[1]

        if imageExt == "jpeg":
            imageExt = "jpg"

        imports.append(f"import Image{i} from './textures/{i}.{imageExt}'")

    print(template(outMaterials, imports))


if __name__ == "__main__":
    main()
